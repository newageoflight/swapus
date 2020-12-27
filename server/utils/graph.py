from typing import List
from graph.multiswap import MultiSwap, MultiSwapProtoGraph
from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
from ..models.graph import SwapGroupInDB, SwapGroupMemberSingleWant
from graph.graph import edge_covering_cycles

def swap_graph_from_group_data(group: SwapGroupInDB) -> MultiSwapProtoGraph:
    as_swaps = []
    for member in group.members:
        if member.have and member.want:
            have = group.options.index(member.have)
            want = [group.options.index(w) for w in member.want]
            data = {"username": member.username}
            as_swaps.append(MultiSwap(have, want, data))
    return MultiSwapProtoGraph(as_swaps)

def translate_cycles_into_member_lists(cycles, group: SwapGroupInDB) -> List[List[SwapGroupMemberSingleWant]]:
    proto = []
    for cycle in cycles:
        new_cycle = []
        for edge in cycle:
            print(edge)
            old_have, old_want, _, edge_data = edge
            have = group.options[old_have]
            want = group.options[old_want]
            username = edge_data.get("username")
            new_cycle.append(SwapGroupMemberSingleWant(have=have, want=want, username=username))
        proto.append(new_cycle)
    return proto

def translate_cycles_into_demongoed_member_lists(cycles, group: SwapGroupInDB) -> List[List[dict]]:
    proto = translate_cycles_into_member_lists(cycles, group)
    return [[m.dict() for m in c] for c in proto]

async def recalculate_swap_paths(group_id: str, db: AsyncIOMotorClient) -> None:
    group = await db.swapus.groups.find_one({"_id": ObjectId(group_id)})
    # at this point it should also check if there are any additions to the options and update those too
    # MultiSwap takes integers so you need to translate it first
    group_in_db = SwapGroupInDB.from_mongo(group)
    new_swap_graph = swap_graph_from_group_data(group_in_db)
    best_configuration = new_swap_graph.determine_optimal_configuration()
    proto_best_swap_sequence = best_configuration.suggest_swaps(edge_covering_cycles(best_configuration))
    # will return a list of list of proto-SwapGroupMembers
    best_swap_sequence_demongoed = translate_cycles_into_demongoed_member_lists(proto_best_swap_sequence, group_in_db)
    update_best_sequence = await db.swapus.groups.update_one({"_id": ObjectId(group_id)}, {"$set":
        {"swap_cycles": best_swap_sequence_demongoed}
    })