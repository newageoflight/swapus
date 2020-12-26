from dataclasses import astuple, dataclass, field
from functools import reduce
from typing import List, Optional

from .graph import Swap, SwapGraph, edges_uncoverable

import math
import random

@dataclass
class MultiSwap(object):
    have: int
    want: List[int]
    data: Optional[dict] = field(default_factory=lambda: {"name": ""})

class MultiSwapProtoGraph(object):
    def __init__(self, swaps: List[MultiSwap]) -> None:
        # retain the original list
        self.swaps = swaps

    def count_legal_configurations(self):
        return reduce(lambda a,b: a*b, [len(s.want) for s in self.swaps])

    def determine_optimal_configuration(self):
        polyswaps = [i for i, s in enumerate(self.swaps) if len(s.want) > 1]
        if polyswaps:
            return self.anneal_configurations() 
        else:
            # implies that all arrays are length 1 or less
            # ignore any empty wants
            uniswaps = [Swap(have, want[0], data) for have, want, data in map(astuple, self.swaps) if len(want) == 1]
            return SwapGraph(uniswaps)

    def anneal_configurations(self, T=10000, cool_rate=0.001, iterlimit=10000000) -> SwapGraph:
        # How will this work?
        # Start with a random configuration.
        usable_swaps = self.swaps.copy()
        current_state = [Swap(s.have, random.choice(s.want), s.data) for s in usable_swaps]
        current_graph = SwapGraph(current_state)
        uncoverable_current = edges_uncoverable(current_graph)
        iters = 0
        best_state = current_state
        min_uncoverable = edges_uncoverable(current_graph)
        # Decide whether or not to accept the new config based on total coverability and temperature
        while T >= 1e-8 and iters < iterlimit:
            index_to_change = random.choice([i for i, s in enumerate(usable_swaps) if len(s.want) > 1])
            replacement_item = usable_swaps[index_to_change]
            next_state = current_state.copy()
            next_state[index_to_change] = Swap(replacement_item.have, random.choice(replacement_item.want), replacement_item.data)
            next_graph = SwapGraph(next_state)
            uncoverable_next = edges_uncoverable(next_graph)
            accepted = 1 if uncoverable_next < uncoverable_current else math.exp((uncoverable_current - uncoverable_next)/T)
            if accepted >= random.random():
                current_state = next_state
                current_graph = next_graph
                uncoverable_current = uncoverable_next
            if uncoverable_current < min_uncoverable:
                best_state = current_state
                min_uncoverable = uncoverable_current
            T *= 1 - cool_rate
            iters += 1
        return SwapGraph(best_state)
