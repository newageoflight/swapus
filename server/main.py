from fastapi import FastAPI

from .auth import router as auth_router

app = FastAPI()

app.include_router(auth_router)

# ok hear me out, while I could add a root path to the app as an argument
# it seems to fuck up when i try to call it from react, so this way stays for now
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