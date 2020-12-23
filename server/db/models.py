from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from fastapi import Form

from ..utils import as_form
from .mongo_utils import OID, MongoModel

class User(MongoModel):
    username: str = Field()
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserToInsert(User):
    hashed_password: str

class UserInDB(UserToInsert):
    id: OID = Field()

@as_form
class RegistrationForm(BaseModel):
    username: str
    password: str
    email: Optional[str]

async def get_user(conn: AsyncIOMotorClient, username: str) -> UserInDB:
    row = await conn.swapus.users.find_one({"username": username})
    if row:
        return UserInDB.from_mongo(row)