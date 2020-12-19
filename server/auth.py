from datetime import timedelta
from fastapi import Depends, APIRouter, Request
from fastapi_users import FastAPIUsers, models
from fastapi_users.authentication import JWTAuthentication
from fastapi_users.db import MongoDBUserDatabase
# from fastapi.security import OAuth2PasswordRequestForm
# from fastapi_login import LoginManager
# from fastapi_login.exceptions import InvalidCredentialsException

import motor.motor_asyncio
import os

DATABASE_URL = "***REMOVED***"
client = motor.motor_asyncio.AsyncIOMotorClient(DATABASE_URL, uuidRepresentation="standard")
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])
SECRET = os.urandom(24).hex()

# # todo: use fastapi-users to handle the auth stuff
# # create a users collection in mongodb

# fake_db = {"newageoflight": {"password": "bender238"}}

# @manager.user_loader
# def load_user(uname: str):
#     user = fake_db.get(uname)
#     return user

# # based on this example: https://pypi.org/project/fastapi-login/
# @router.post("/token")
# async def login(data: OAuth2PasswordRequestForm = Depends()):
#     username = data.username
#     password = data.password

#     user = load_user(username)
#     if not user:
#         raise InvalidCredentialsException
#     elif password != user["password"]:
#         raise InvalidCredentialsException

#     access_token = manager.create_access_token(data=dict(sub=username), expires_delta=timedelta(hours=12))
#     print(f"User {username} logged in successfully! Access token granted")
#     return {"access_token": access_token, "token_type": "bearer"}