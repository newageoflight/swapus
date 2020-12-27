from typing import Any, Optional
from pydantic import BaseModel

class Success(BaseModel):
    success: bool
    count: Optional[int]
    data: Optional[Any]