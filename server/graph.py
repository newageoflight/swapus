from fastapi import Depends, APIRouter

from .auth import manager

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])

@router.get("/test")
async def test(user=Depends(manager)):
    return {"message": "Hello World!"}