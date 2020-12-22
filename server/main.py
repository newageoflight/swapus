from fastapi import FastAPI

from .auth import router as AuthRouter

import asyncio
import platform

# This part only exists because Windows is retarded.
if platform.system() == "Windows":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
# Ok even that's not going to fix it, the real reason this won't work has nothing to do with how I've programmed it
# Instead, it has everything to do with Windows being retarded i.e. unsupported by Mongo's async driver:
# https://motor.readthedocs.io/en/stable/api-asyncio/asyncio_motor_client.html

app = FastAPI()
app.include_router(AuthRouter)

# Brief outline of what the API will need to do:
# Core features
# - Create a swap group (i.e. a node list)
# - Add users to swap groups
# - Add swap demands to a swap group (i.e. edges)
# - Allow swaps to be marked as complete (i.e. remove edges from a given multidigraph)
# - Serve swap data to users
# Social features
# - Socket connection for chat