from datetime import timedelta
from fastapi import Depends, APIRouter, status
from fastapi.exceptions import HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from .auth_utils import (ACCESS_TOKEN_EXPIRE_MINUTES, authenticate_user, create_access_token,
    get_current_active_user, User, oauth2_scheme)

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register")
async def register_new_user(form_data):
    # server receives username, password and full name of registrant
    # hashes password using bcrypt
    # adds it to user database in mongo
    pass

@router.get("/whoami")
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/protected")
async def test_protected_endpoint(token: str = Depends(oauth2_scheme)):
    return {"message": "Hello World!", "token": token}