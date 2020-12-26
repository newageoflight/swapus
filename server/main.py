from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.requests import Request

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
# this is the best way to do it while preserving react's overall directory structure
app.mount("/static", StaticFiles(directory=os.path.join("client", "build", "static")), name="static")
templates = Jinja2Templates(directory=os.path.join("client", "build"))

app.include_router(AuthRouter)
app.include_router(GraphRouter)

@app.on_event("startup")
async def connect_mongo():
    db.client = AsyncIOMotorClient("***REMOVED***")

@app.on_event("shutdown")
async def disconnect_mongo():
    db.client.close()

# TODO: set a catch-all route that will still forward to the other routes in the API
@app.get("/{full_path:path}")
async def serve_spa(full_path, request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Brief outline of what the API will need to do:
# Core features
# - Create a swap group (i.e. a node list)
# - Add users to swap groups
# - Add swap demands to a swap group (i.e. edges)
# - Allow swaps to be marked as complete (i.e. remove edges from a given multidigraph)
# - Serve swap data to users
# Social features
# - Socket connection for chat