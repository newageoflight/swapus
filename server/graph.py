from typing import List
from fastapi import APIRouter, Depends, Request, status
from fastapi.exceptions import HTTPException
from fastapi.logger import logger
from sse_starlette.sse import EventSourceResponse

from bson.objectid import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from .db.db import get_database
from .models.auth import User
from .models.generic import Success
from .models.graph import MemberUpdateForm, SwapGroup, SwapGroupCreationForm, SwapGroupInDB, SwapGroupMember
from .utils.auth import get_current_active_user, oauth2_scheme
from .utils.graph import recalculate_swap_paths

import asyncio

CHANGE_QUEUE = []
STREAM_DELAY = 1 # second
STREAM_RETRY_TIMEOUT = 15000 # milliseconds
router = APIRouter(prefix="/api/v1/graph", tags=["graph"])

@router.post("/create", response_model=Success)
async def create_group(
    creation_form: SwapGroupCreationForm,
    db: AsyncIOMotorClient = Depends(get_database),
    current_user: User = Depends(get_current_active_user)
) -> Success:
    """
    Create a swap group
    Accepts JSON
    """
    # since this is inherently a group for swapping things
    # each member item should be an interface consisting of username, have, want
    if creation_form.members:
        # check that all the users actually exist
        find_all = await db.swapus.users.find({"username": {"$in": creation_form.members}}).to_list(None)
        # if one or more of the users doesn't exist, return an error indicating who is missing
        if len(find_all) == len(creation_form.members):
            existing_usernames = [m for m in find_all if m["username"] in find_all]
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail={"missing": [m for m in creation_form.members if m not in existing_usernames]})
        # then make the list
        group_member_list = [*creation_form.members, current_user.username]
    else:
        group_member_list = [current_user.username]
    group_members = [SwapGroupMember(username=u) for u in group_member_list]
    new_group = SwapGroup(**creation_form.dict(exclude={"members"}), members=[g.dict() for g in group_members], owner=current_user.username)
    new_group_id = await db.swapus.groups.insert_one(new_group.dict())
    return Success(success=True, data=str(new_group_id.inserted_id))

# this seems stupidly insecure but I'm planning to fix it down the line
@router.put("/join/{group_id}", response_model=Success)
async def join_group(group_id: str, db: AsyncIOMotorClient = Depends(get_database), current_user: User = Depends(get_current_active_user)) -> Success:
    """
    Join a group with a given code (uses ObjectId at the moment, planning to fix it later)
    """
    add_user = SwapGroupMember(username=current_user.username)
    group = await db.swapus.groups.update_one({"_id": ObjectId(group_id)}, {"$addToSet": {"members": add_user.dict()}})
    return Success(success=group.acknowledged, data=group_id)

@router.patch("/group/{group_id}", response_model=SwapGroupInDB)
async def modify_swap_preferences(group_id: str, modification: MemberUpdateForm, current_user: User = Depends(get_current_active_user), db: AsyncIOMotorClient = Depends(get_database)) -> SwapGroupInDB:
    """
    Modify a user's swap preferences within a group
    Triggers a recall of the matching algorithm
    """
    update = await db.swapus.groups.update_one({"_id": ObjectId(group_id), "members.username": current_user.username}, {"$set": {
        "members.$": modification.dict()
    }})
    CHANGE_QUEUE.append(group_id)
    new_group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    to_ret = SwapGroupInDB.from_mongo(new_group)
    return to_ret

# should this also use SSE? give the homepage the ability to update in real-time?
@router.get("/usergroups", response_model=List[SwapGroupInDB])
async def get_my_groups(current_user: User = Depends(get_current_active_user), db: AsyncIOMotorClient = Depends(get_database)) -> List[SwapGroupInDB]:
    """
    Get the groups that the current user belongs to
    """
    groups = await db.swapus.groups.find({"members.username": current_user.username}).to_list(None)
    to_ret = [SwapGroupInDB.from_mongo(g) for g in groups]
    return to_ret

@router.get("/owngroups", response_model=List[SwapGroupInDB])
async def get_own_groups(current_user: User = Depends(get_current_active_user), db: AsyncIOMotorClient = Depends(get_database)) -> List[SwapGroupInDB]:
    """
    Get the groups that the current user owns
    """
    groups = await db.swapus.groups.find({"owner": current_user.username}).to_list(None)
    to_ret = [SwapGroupInDB.from_mongo(g) for g in groups]
    return to_ret

@router.get("/group/{group_id}", response_model=SwapGroupInDB)
async def get_group_by_id(group_id: str, token: str = Depends(oauth2_scheme), db: AsyncIOMotorClient = Depends(get_database)) -> List[SwapGroupInDB]:
    """
    Get a group with a specific id (depending on if the user is allowed to access it)
    """
    group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    # convert it first
    to_ret = SwapGroupInDB.from_mongo(group)
    return to_ret

@router.delete("/group/{group_id}", response_model=Success)
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
        return Success(success=result.deleted_count > 0, count=result.deleted_count)
    else:
        # Remove current user
        result = await db.swapus.groups.update_one({"_id": ObjectId(group_id)}, {"$pull": {"members": {"username": current_user.username}}})
        CHANGE_QUEUE.append(group_id)
        return Success(success=result.acknowledged, count=1)

# the recalculation needs to be fixed because it's seriously slow, which users likely won't tolerate. just use SSE, no need for sockets
# https://sairamkrish.medium.com/handling-server-send-events-with-python-fastapi-e578f3929af1
# so the EventStream API for JavaScript doesn't natively support including Auth headers which is... problematic
# THIS IS DANGEROUSLY UNSAFE FOR NOW, DO NOT PUSH OUT
# the server is successfully emitting events but somehow the client isn't receiving them???
@router.get("/stream")
async def subscribe_to_group_updates(req: Request, db: AsyncIOMotorClient = Depends(get_database)):
    """
    SSE endpoint called when some part of the group is updated.
    """
    async def status_event_generator():
        counter = 1
        while True:
            # TODO: calculate a new swap cycle for the popped item if CHANGE_QUEUE is not empty, then broadcast the update to the users involved
            if await req.is_disconnected():
                logger.debug("[SSE] Request disconnected")
                break

            if CHANGE_QUEUE:
                print("Change queue is nonempty:",CHANGE_QUEUE)
                top_item = CHANGE_QUEUE.pop(0)
                send_data = {"id": top_item}
                await recalculate_swap_paths(top_item, db)
                print("Swaps recalculated, emitting event")
                yield {
                    "event": "update",
                    "id": counter,
                    "retry": STREAM_RETRY_TIMEOUT,
                    "data": send_data,
                }
                logger.debug("[SSE] Current status: "+str(send_data))
            else:
                logger.debug("[SSE] No change in status")

            counter += 1
            await asyncio.sleep(STREAM_DELAY)
    return EventSourceResponse(status_event_generator())