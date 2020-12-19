from typing import List

from .graph import Swap, SwapGraph, edge_coverability

def get_coverability(swaps: List[Swap]):
    """
    docstring
    """
    return edge_coverability(SwapGraph(swaps))