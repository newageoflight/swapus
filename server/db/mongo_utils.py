from datetime import datetime
from pydantic import BaseModel
from pydantic.main import BaseConfig

from bson.objectid import ObjectId
from pymongo.errors import InvalidId

class OID(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        try:
            return ObjectId(str(v))
        except InvalidId:
            raise ValueError("Not a valid ObjectId")

class MongoModel(BaseModel):
    class Config(BaseConfig):
        json_encoders = {
            datetime: lambda dt: dt.isoformat(),
            ObjectId: lambda oid: str(oid)
        }

    @classmethod
    def from_mongo(cls, data: dict):
        """Convert _id into id"""
        if not data:
            return data
        id = data.pop("_id", None)
        return cls(**dict(data, id=id))

    def mongo(self, **kwargs):
        exclude_unset = kwargs.pop("exclude_unset", True)
        by_alias = kwargs.pop("by_alias", True)

        parsed = self.dict(
            exclude_unset=exclude_unset,
            by_alias=by_alias,
            **kwargs,
        )

        if "_id" not in parsed and "id" in parsed:
            parsed["_id"] = parsed.pop("id")
        
        return parsed

def demongoify(mongo_model: MongoModel, **kwargs) -> dict:
    to_ret = mongo_model.dict(**kwargs)
    old_id = to_ret.pop("id")
    return dict(**to_ret, id=str(old_id))