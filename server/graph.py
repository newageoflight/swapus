from typing import List
from fastapi.exceptions import HTTPException
from fastapi.param_functions import Path
from graph.graph import edge_covering_cycles
from fastapi import APIRouter, Depends, status

from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from .db.db import get_database
from .db.mongo_utils import demongoify
from .models.auth import User
from .models.graph import MemberUpdateForm, SwapGroup, SwapGroupCreationForm, SwapGroupInDB, SwapGroupMember
from .utils.auth import get_current_active_user, oauth2_scheme
from .utils.graph import swap_graph_from_group_data, translate_cycles_into_demongoed_member_lists

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])

@router.post("/create")
async def create_group(
    creation_form: SwapGroupCreationForm,
    db: AsyncIOMotorClient = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
) -> str:
    """
    Create a swap group
    Accepts JSON
    """
    # since this is inherently a group for swapping things
    # each member item should be an interface consisting of username, have, want
    if creation_form.members:
        group_member_list = [*creation_form.members, current_user.username]
    else:
        group_member_list = [current_user.username]
    group_members = [SwapGroupMember(username=u) for u in group_member_list]
    new_group = SwapGroup(**creation_form.dict(exclude={"members"}), members=[g.dict() for g in group_members], owner=current_user.username)
    new_group_id = await db.swapus.groups.insert_one(new_group.dict())
    return str(new_group_id.inserted_id)

# this seems stupidly insecure but I'm planning to fix it down the line
@router.put("/join/{group_id}")
async def join_group(group_id: str, db: AsyncIOMotorClient = Depends(get_database), current_user: User = Depends(get_current_active_user)):
    """
    Join a group with a given code (uses ObjectId at the moment, planning to fix it later)
    """
    add_user = SwapGroupMember(username=current_user.username)
    group = await db.swapus.groups.update_one({"_id": ObjectId(group_id)}, {"$addToSet": {"members": add_user.dict()}})
    return {"success": group.acknowledged, "data": group_id}

@router.patch("/group/{group_id}", response_model=SwapGroupInDB)
async def modify_swap_preferences(group_id: str, modification: MemberUpdateForm, current_user: User = Depends(get_current_active_user), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Modify a user's swap preferences within a group
    Triggers a recall of the matching algorithm
    """
    update = await db.swapus.groups.update_one({"_id": ObjectId(group_id), "members.username": current_user.username}, {"$set": {
        "members.$": modification.dict()
    }})
    # now that it's been updated, recalculate the optimal swap
    group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    # at this point it should also check if there are any additions to the options and update those too
    # MultiSwap takes integers so you need to translate it first
    group_in_db = SwapGroupInDB.from_mongo(group)
    new_swap_graph = swap_graph_from_group_data(group_in_db)
    best_configuration = new_swap_graph.determine_optimal_configuration()
    proto_best_swap_sequence = best_configuration.suggest_swaps(edge_covering_cycles(best_configuration))
    # will return a list of list of proto-SwapGroupMembers
    best_swap_sequence_demongoed = translate_cycles_into_demongoed_member_lists(proto_best_swap_sequence, group_in_db)
    update_best_sequence = await db.swapus.groups.update_one({"_id": ObjectId(group_id)}, {"$set":
        {"swap_cycles": best_swap_sequence_demongoed}
    })
    new_group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    to_ret = SwapGroupInDB.from_mongo(new_group)
    return to_ret

@router.get("/usergroups", response_model=List[SwapGroupInDB])
async def get_my_groups(current_user: User = Depends(get_current_active_user), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Get the groups that the current user belongs to
    """
    groups = await db.swapus.groups.find({"members.username": current_user.username}).to_list(None)
    to_ret = [SwapGroupInDB.from_mongo(g) for g in groups]
    return to_ret

@router.get("/owngroups", response_model=List[SwapGroupInDB])
async def get_own_groups(current_user: User = Depends(get_current_active_user), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Get the groups that the current user owns
    """
    groups = await db.swapus.groups.find({"owner": current_user.username}).to_list(None)
    to_ret = [SwapGroupInDB.from_mongo(g) for g in groups]
    return to_ret

@router.get("/group/{group_id}", response_model=SwapGroupInDB)
async def get_group_by_id(group_id: str, token: str = Depends(oauth2_scheme), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Get a group with a specific id (depending on if the user is allowed to access it)
    """
    group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    # convert it first
    to_ret = SwapGroupInDB.from_mongo(group)
    return to_ret

@router.delete("/group/{group_id}", response_model=int)
async def remove_group_by_id(group_id: str, current_user: User = Depends(get_current_active_user), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Deletes the group if the user requesting is the group's owner.
    Otherwise, removes the user from the group.
    """
    # first find the group
    group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    # do they own this group?
    if group["owner"] == current_user.username:
        # Delete entire group
        result = await db.swapus.groups.delete_one({"_id": ObjectId(group_id)})
        return {"success": result.deleted_count > 0, "count": result.deleted_count}
    else:
        # Remove current user
        result = await db.swapus.groups.update_one({"_id": ObjectId(group_id)}, {"$pull": {"members.username": current_user.username}})
        return {"success": True, "count": 1}