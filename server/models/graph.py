
from typing import Optional, List
from pydantic import BaseModel, Field

from ..utils.utils import as_form
from ..db.mongo_utils import MongoModel, OID

class SwapGroupMember(MongoModel):
    username: str
    have: Optional[str]
    want: Optional[List[str]]
    comment: Optional[str]

class SwapGroupMemberSingleWant(MongoModel):
    username: str
    have: Optional[str]
    want: Optional[str]
    comment: Optional[str]

@as_form
class MemberUpdateForm(SwapGroupMember):
    pass

class SwapGroup(MongoModel):
    name: str
    options: List[str]
    members: List[SwapGroupMember]
    owner: str
    swap_cycles: Optional[List[List[SwapGroupMemberSingleWant]]]

class SwapGroupInDB(SwapGroup):
    id: OID = Field()

@as_form
class SwapGroupCreationForm(BaseModel):
    name: str
    options: List[str]
    members: Optional[List[str]]