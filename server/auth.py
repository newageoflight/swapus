from fastapi import Request
from fastapi_users import FastAPIUsers, models
from fastapi_users.authentication import CookieAuthentication
from fastapi_users.db import MongoDBUserDatabase

import motor.motor_asyncio
import os

DATABASE_URL = "***REMOVED***"
SECRET = os.urandom(24).hex()

class User(models.BaseUser):
    pass

class UserCreate(models.BaseUserCreate):
    pass

class UserUpdate(User, models.BaseUserUpdate):
    pass

class UserDB(User, models.BaseUserDB):
    pass

client = motor.motor_asyncio.AsyncIOMotorClient(DATABASE_URL, uuidRepresentation="standard")
db = client["swapus"]
user_col = db["users"]
user_db = MongoDBUserDatabase(UserDB, user_col)
# if you want to use fastapi-login see here: https://pypi.org/project/fastapi-login/

def on_after_register(user: UserDB, request: Request):
    print(f"User {user.id} has registered")

def on_after_forgot_password(user: UserDB, token: str, request: Request):
    print(f"User {user.id} has forgotten their password. Reset token: {token}")

cookie_auth = CookieAuthentication(secret=SECRET, lifetime_seconds=3600)
fastapi_users = FastAPIUsers(user_db, [cookie_auth], User, UserCreate, UserUpdate, UserDB)