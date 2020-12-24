from fastapi.exceptions import HTTPException
from graph.graph import edge_covering_cycles
from fastapi import APIRouter, Depends, status

from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from .db.db import get_database
from .db.mongo_utils import demongoify
from .db.models import User
from .models.graph import MemberUpdateForm, SwapGroup, SwapGroupCreationForm, SwapGroupInDB, SwapGroupMember
from .utils.auth import get_current_active_user, get_current_user, oauth2_scheme
from .utils.graph import swap_graph_from_group_data, translate_cycles_into_demongoed_member_lists

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])

@router.post("/create")
async def create_group(
    creation_form: SwapGroupCreationForm = Depends(SwapGroupCreationForm.as_form),
    db: AsyncIOMotorClient = Depends(get_database),
    current_user: User = Depends(get_current_user)
):
    """
    Create a swap group
    Accepts form data
    """
    # since this is inherently a group for swapping things
    # each member item should be an interface consisting of username, have, want
    if creation_form.members:
        group_member_list = list(*creation_form.members, current_user.username)
    else:
        group_member_list = [current_user.username]
    group_members = [SwapGroupMember(username=u) for u in group_member_list]
    new_group = SwapGroup(**creation_form.dict(exclude={"members"}), members=[g.dict() for g in group_members], owner=current_user.username, swap_cycles=[[]])
    new_group_id = await db.swapus.groups.insert_one(new_group.dict())
    new_group_in_db = SwapGroupInDB.from_mongo(dict(_id=new_group_id.inserted_id, **new_group.dict()))
    return {"success": new_group_id.acknowledged, "created": new_group_id.inserted_id, "data": demongoify(new_group_in_db)}

# this seems stupidly insecure but I'm planning to fix it down the line
@router.put("/join/{groupcode}")
async def join_group(groupcode, db: AsyncIOMotorClient = Depends(get_database), current_user: User = Depends(get_current_user)):
    """
    Join a group with a given code (uses ObjectId at the moment, planning to fix it later)
    """
    add_user = SwapGroupMember(username=current_user.username)
    group = await db.swapus.groups.update_one({"_id": ObjectId(groupcode)}, {"$addToSet": {"members": add_user.dict()}})
    return {"success": group.acknowledged, "data": groupcode}

@router.patch("/modify")
async def modify_swap_preferences(modification: MemberUpdateForm = Depends(MemberUpdateForm.as_form), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Modify a user's swap preferences within a group
    Triggers a recall of the matching algorithm
    """
    update = await db.swapus.groups.update_one({"_id": ObjectId(modification.db_id), "members.username": modification.username}, {"$set": {
        "members.$": modification.dict(exclude={"db_id"})
    }})
    # now that it's been updated, recalculate the optimal swap
    group = await db.swapus.groups.find_one({"_id": ObjectId(modification.db_id)})
    # at this point it should also check if there are any additions to the options and update those too
    # MultiSwap takes integers so you need to translate it first
    group_in_db = SwapGroupInDB.from_mongo(group)
    new_swap_graph = swap_graph_from_group_data(group_in_db)
    best_configuration = new_swap_graph.determine_optimal_configuration()
    proto_best_swap_sequence = best_configuration.suggest_swaps(edge_covering_cycles(best_configuration))
    # will return a list of list of proto-SwapGroupMembers
    best_swap_sequence_demongoed = translate_cycles_into_demongoed_member_lists(proto_best_swap_sequence, group_in_db)
    update_best_sequence = await db.swapus.groups.update_one({"_id": ObjectId(modification.db_id)}, {"$set":
        {"swap_cycles": best_swap_sequence_demongoed}
    })
    new_group = await db.swapus.groups.find_one({"_id": ObjectId(modification.db_id)})
    to_ret = SwapGroupInDB.from_mongo(new_group)
    print(to_ret)
    return {"success": update.acknowledged, "data": demongoify(to_ret)}

@router.get("/usergroups")
async def get_my_groups(current_user: User = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Get the groups that the current user belongs to
    """
    groups = await db.swapus.groups.find({"members.username": current_user.username}).to_list(None)
    to_ret = [SwapGroupInDB.from_mongo(g) for g in groups]
    out_data = [demongoify(g) for g in to_ret]
    return {"success": out_data is not None, "data": out_data}

@router.get("/owngroups")
async def get_my_groups(current_user: User = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Get the groups that the current user belongs to
    """
    groups = await db.swapus.groups.find({"owner": current_user.username}).to_list(None)
    to_ret = [SwapGroupInDB.from_mongo(g) for g in groups]
    out_data = [demongoify(g) for g in to_ret]
    return {"success": out_data is not None, "data": out_data}

@router.get("/group/{group_id}")
async def get_group_by_id(group_id, token: str = Depends(oauth2_scheme), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Get a group with a specific id (depending on if the user is allowed to access it)
    """
    group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    # convert it first
    to_ret = SwapGroupInDB.from_mongo(group)
    print(to_ret)
    return {"success": group is not None, "data": demongoify(to_ret)}

@router.delete("/group/{group_id}")
async def remove_group_by_id(group_id, current_user: User = Depends(get_current_user), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Delete a group with a specific id (only allowed if the user owns the group)
    """
    # first find the group
    group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    # do they own this group?
    if group["owner"] != current_user.username:
        raise HTTPException(status.HTTP_405_METHOD_NOT_ALLOWED)
    # now remove it
    result = await db.swapus.groups.delete_one({"_id": ObjectId(group_id)})
    return {"success": True, "deleted": result.deleted_count}