from typing import List
from graph.multiswap import MultiSwap, MultiSwapProtoGraph
from ..models.graph import SwapGroupInDB, SwapGroupMemberSingleWant

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