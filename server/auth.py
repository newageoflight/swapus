from typing import List, Optional
from datetime import timedelta
from fastapi import Depends, APIRouter, status
from fastapi.exceptions import HTTPException
from fastapi.param_functions import Query
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorClient

from .db.db import get_database
from .db.mongo_utils import demongoify
from .models.auth import RegistrationForm, User, UserInDB, UserToInsert
from .models.generic import Success
from .utils.auth import (ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token,
    get_current_active_user, get_password_hash, oauth2_scheme)

# Consider adding cookie auth
# https://medium.com/data-rebels/fastapi-how-to-add-basic-and-cookie-authentication-a45c85ef47d3
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Login endpoint. Returns an access JWT that can be stored as a cookie.
    """
    user = await authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserInDB)
async def register_new_user(form_data: RegistrationForm = Depends(RegistrationForm.as_form), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Register a new user in the database
    """
    # server receives username, password and full name of registrant
    # hashes password using bcrypt
    hashed_password = get_password_hash(form_data.password)
    # if the user already exists, throw an error
    existing_user = await db.swapus.users.find_one({"username": form_data.username})
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username already exists!")
    # create a new userindb object
    new_user = UserToInsert(**dict(**form_data.dict(exclude={"password"}), hashed_password=hashed_password))
    new_user_id = await db.swapus.users.insert_one(new_user.dict())
    if not new_user_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User failed to insert")
    new_user_in_db = UserInDB(**dict(id=new_user_id.inserted_id, **new_user.dict()))
    return new_user_in_db

@router.get("/whoami", response_model=User)
async def read_current_user(current_user: User = Depends(get_current_active_user)):
    """
    Returns the current active user
    """
    return current_user

@router.get("/whoami/{username}", response_model=UserInDB)
async def read_user_by_username(username: str, db: AsyncIOMotorClient = Depends(get_database), token: str = Depends(oauth2_scheme)):
    """
    Returns the current active user
    """
    user = await db.swapus.users.find_one({"username": username})
    return UserInDB.from_mongo(user)

@router.patch("/whoami", response_model=UserInDB)
async def modify_current_user(modification: User, current_user: User = Depends(get_current_active_user), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Update the current active user with a given modification
    """
    await db.swapus.users.update_one({"_id": current_user.id, "username": current_user.username}, {"$set": modification.dict()})
    new_user = await db.swapus.users.find_one({"username": current_user.username})
    to_ret = UserInDB.from_mongo(new_user)
    return to_ret

@router.get("/userunique/{username}", response_model=Success)
async def ensure_username_unique(username, db: AsyncIOMotorClient = Depends(get_database)):
    """
    Endpoint called during the registration process to ensure that a username is unique (i.e. doesn't already exist in the database)
    """
    user = await db.swapus.users.find_one({"username": username})
    to_ret = None
    if user:
        user_model = UserInDB.from_mongo(user)
        to_ret = demongoify(user_model)
    return Success(success=user is None, exists=to_ret)

@router.get("/userexist", response_model=Success)
async def ensure_usernames_exist(usernames: List[str] = Query(...), db: AsyncIOMotorClient = Depends(get_database)):
    """
    Endpoint called during group creation to ensure that a set of usernames exists in the database.
    """
    users = await db.swapus.users.find({"username": {"$in": usernames}}).to_list(None)
    to_ret = [UserInDB.from_mongo(user) for user in users]
    return Success(success=len(users) == len(usernames), exists=[demongoify(u) for u in to_ret])