from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient

from .auth import router as AuthRouter
from .graph import router as GraphRouter
from .db.db import db

import asyncio
import os
import platform

# This part only exists because Windows is retarded.
if platform.system() == "Windows":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
# Ok even that's not going to fix it, the real reason this won't work has nothing to do with how I've programmed it
# Instead, it has everything to do with Windows being retarded i.e. unsupported by Mongo's async driver:
# https://motor.readthedocs.io/en/stable/api-asyncio/asyncio_motor_client.html
# Well no, I actually tried this on Linux too. Someone had a similar problem with Sanic.
# The best option is to try to attach the database to the FastAPI instance somehow.
# Actually, someone seems to have figured it out:
# https://github.com/tiangolo/fastapi/issues/1515
# also look here:
# https://github.com/markqiu/fastapi-mongodb-realworld-example-app/blob/master/app/crud/user.py

app = FastAPI(docs_url="/api/v1/docs")
app.mount("/", StaticFiles(directory=os.path.join("client", "build"), html=True), name="static")
app.include_router(AuthRouter)
app.include_router(GraphRouter)

@app.on_event("startup")
async def connect_mongo():
    db.client = AsyncIOMotorClient("***REMOVED***")

@app.on_event("shutdown")
async def disconnect_mongo():
    db.client.close()


# Brief outline of what the API will need to do:
# Core features
# - Create a swap group (i.e. a node list)
# - Add users to swap groups
# - Add swap demands to a swap group (i.e. edges)
# - Allow swaps to be marked as complete (i.e. remove edges from a given multidigraph)
# - Serve swap data to users
# Social features
# - Socket connection for chat