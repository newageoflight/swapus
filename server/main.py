from fastapi import FastAPI

from .auth import SECRET, fastapi_users, cookie_auth, on_after_forgot_password, on_after_register

app = FastAPI()

app.include_router(fastapi_users.get_auth_router(cookie_auth), prefix="/api/v1/auth/cookie", tags=["auth"])
app.include_router(fastapi_users.get_register_router(on_after_register), prefix="/api/v1/auth", tags=["auth"])
app.include_router(fastapi_users.get_reset_password_router(SECRET, after_forgot_password=on_after_forgot_password),
    prefix="/api/v1/auth", tags=["auth"])
app.include_router(fastapi_users.get_users_router(), prefix="/api/v1/users", tags=["users"])

# ok hear me out, while I could add a root path to the app as an argument
# it seems to fuck up when i try to call it from the react app, so this way stays for now
@app.get("/api/v1/root")
async def root():
    return {"message": "Hello World!"}

# Brief outline of what the API will need to do:
# Core features
# - Create a swap group (i.e. a node list)
# - Add users to swap groups
# - Add swap demands to a swap group (i.e. edges)
# - Allow swaps to be marked as complete (i.e. remove edges from a given multidigraph)
# - Serve swap data to users
# Social features
# - Socket connection for chat