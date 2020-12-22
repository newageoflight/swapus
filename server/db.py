from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine

client = AsyncIOMotorClient("***REMOVED***")
engine = AIOEngine(motor_client=client, database="swapus")