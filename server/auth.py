from datetime import timedelta
from fastapi import Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_login import LoginManager
from fastapi_login.exceptions import InvalidCredentialsException

import os

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])
SECRET = os.urandom(24).hex()
manager = LoginManager(SECRET, tokenUrl="/api/v1/auth/token")

fake_db = {"newageoflight": {"password": "bender238"}}

@manager.user_loader
def load_user(uname: str):
    user = fake_db.get(uname)
    return user

# based on this example: https://pypi.org/project/fastapi-login/
@router.post("/token")
async def login(data: OAuth2PasswordRequestForm = Depends()):
    username = data.username
    password = data.password

    user = load_user(username)
    if not user:
        raise InvalidCredentialsException
    elif password != user["password"]:
        raise InvalidCredentialsException

    access_token = manager.create_access_token(data=dict(sub=username), expires_delta=timedelta(hours=12))
    print(f"User {username} logged in successfully! Access token granted")
    return {"access_token": access_token, "token_type": "bearer"}