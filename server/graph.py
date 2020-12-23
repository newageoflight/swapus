from server.db.models import User
from server.models.graph import SwapGroup, SwapGroupCreationForm, SwapGroupInDB
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorClient

from .db.db import get_database
from .auth_utils import get_current_user, oauth2_scheme

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])

@router.post("/create")
async def create_group(
    creation_form: SwapGroupCreationForm = Depends(SwapGroupCreationForm.as_form),
    db: AsyncIOMotorClient = Depends(get_database),
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_user)
):
    # since this is inherently a group for swapping things
    # each member item should be an interface consisting of username, have, want
    if creation_form.members:
        group_members = list(*creation_form.members, current_user.username)
        new_group = SwapGroup(**creation_form.dict(exclude={"members"}), members=group_members)
    else:
        new_group = SwapGroup(**dict(**creation_form.dict(exclude={"members"}), members=[current_user.username]))
    new_group_id = await db.swapus.groups.insert_one(new_group.dict())
    new_group_in_db = SwapGroupInDB(**dict(id=new_group_id.inserted_id, **new_group.dict()))
    return {"success": True, "created": new_group_in_db.json(), "token": token}

@router.post("/join/{groupcode}")
async def join_group(db: AsyncIOMotorClient = Depends(get_database)):
    pass