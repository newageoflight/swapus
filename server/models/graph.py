
from typing import Optional, List
from pydantic import BaseModel, Field

from ..utils import as_form
from ..db.mongo_utils import MongoModel, OID

class SwapGroupMember(MongoModel):
    username: str
    have: Optional[str]
    want: Optional[List[str]]

class SwapGroup(MongoModel):
    name: str
    options: List[str]
    members: List[SwapGroupMember]

class SwapGroupInDB(SwapGroup):
    id: OID = Field()

@as_form
class SwapGroupCreationForm(BaseModel):
    name: str
    options: List[str]
    members: Optional[List[str]]