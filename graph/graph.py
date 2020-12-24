from collections import Counter
from functools import lru_cache, reduce
from dataclasses import astuple, dataclass, field
from typing import List, Optional, Union

from .utils import counter_cardinality

import networkx as nx

@dataclass
class Swap(object):
    have: int
    want: int
    data: Optional[dict] = field(default_factory=lambda: {"name": ""})

class Cycle(object):
    """
    Data container for a cycle object
    Generates the edge and node cover of the cycle as well
    """
    def __init__(self, cycle: List[int]):
        self.cycle = cycle
        self._edge_counter = None
        self._node_counter = None

    def __repr__(self) -> str:
        return f"Cycle({self.cycle})"

    def __str__(self) -> str:
        return f"Cycle({self.cycle})"

    def get_edge_cover(self) -> Counter:
        if not self._edge_counter:
            self._edge_counter = Counter(list(zip(self.cycle, self.cycle[1:] + self.cycle[:1])))
        return self._edge_counter

    def get_node_cover(self) -> Counter:
        if not self._node_counter:
            self._node_counter = Counter(list(self.cycle))
        return self._node_counter

class SwapGraph(object):
    def __init__(self, edge_list: Union[List[Swap], Counter]) -> None:
        """
        Generates a swap graph from an edge list
        """
        self.graph = nx.MultiDiGraph()
        self.add_edges(edge_list)

    def add_edge(self, edge: Swap) -> None:
        # use the simple add edge method for edges that don't already exist
        # if the edge already exists, increase its weight by one
        self.graph.add_edge(edge.have, edge.want, edge.data)

    def remove_edge(self, edge: Swap) -> None:
        # if the edge exists and its weight is > 1, decrement the weight
        # if the weight is 1, delete it
        self.graph.remove_edge(edge.have, edge.want)

    def add_edges(self, edges: Union[List[Swap], Counter]) -> None:
        if isinstance(edges, Counter):
            edges = [Swap(*e) for e in edges.elements()]
        self.graph.add_edges_from([astuple(e) for e in edges])

    def remove_edges(self, edges: Union[List[Swap], Counter]) -> None:
        if isinstance(edges, Counter):
            edges = [Swap(*e) for e in edges.elements()]
        self.graph.remove_edges_from([astuple(e) for e in edges])

    def _as_digraph(self) -> nx.DiGraph:
        return nx.DiGraph(self.graph)

    def as_counter(self) -> Counter:
        return Counter(self.graph.edges(data=False))

    def strongly_connected_components(self):
        """
        Uses Tarjan's algorithm to find all SCCs in the digraph representation of the swap graph
        """
        scc = nx.strongly_connected_components(self._as_digraph())
        return scc

    def simple_cycles(self) -> List[Cycle]:
        """
        Uses Johnson's algorithm to find all simple cycles in the digraph representation of the swap graph
        """
        cycles = nx.simple_cycles(self._as_digraph())
        return [Cycle(c) for c in sorted(cycles, key=lambda l: len(l), reverse=True)]

    def suggest_swaps(self, covering_cycles: List[Cycle]):
        """
        Assumes that the swaps are taken from edge_covering_cycles
        However, also allows the possibility of manual swaps outside of the algorithm's suggestion
        Does this non-destructively by making a copy of the graph first
        """
        graph_copy = self.graph.copy()
        swap_cycles = []
        for cycle in covering_cycles:
            # get the edge coverage as a list first
            coverage = list(cycle.get_edge_cover().elements())
            # then for each element in the list, pick the first item in the edge list that matches
            swap_cycle = [next(filter(
                    lambda e: e[:2] == edge[:2],
                    graph_copy.edges(keys=True, data=True)
                )) for edge in coverage]
            graph_copy.remove_edges_from(swap_cycle)
            swap_cycles.append(swap_cycle)
        return swap_cycles
            

@lru_cache(maxsize=None)
def edge_covering_cycles(graph: SwapGraph) -> List[Cycle]:
    """
    Returns the optimal set of edge-covering cycles for a given multidigraph
    """
    graph_counter = graph.as_counter()
    cycles = graph.simple_cycles()
    if len(cycles) < 0:
        raise ValueError("Cycles has negative length; this should never happen!")
    elif len(cycles) == 0:
        return []
    elif len(cycles) == 1:
        return cycles
    else:
        best_cycle_set = []
        min_cardinality = 1e8
        for cycle in cycles:
            subgraph = SwapGraph(graph_counter - cycle.get_edge_cover())
            cycle_set = edge_covering_cycles(subgraph)
            coverage_counter = reduce(lambda a,b: a+b, [c.get_edge_cover() for c in cycle_set])
            remaining_cardinality = counter_cardinality(subgraph.as_counter() - coverage_counter)
            if remaining_cardinality < min_cardinality:
                min_cardinality = remaining_cardinality
                best_cycle_set = [cycle] + cycle_set
        return best_cycle_set

def edges_uncoverable(graph: SwapGraph) -> int:
    """
    Returns an integer count of uncoverable edges
    """
    graph_counter = graph.as_counter()
    covering_cycles = edge_covering_cycles(graph)
    if len(covering_cycles) == 0:
        return counter_cardinality(graph_counter)
    else:
        coverage_counter = reduce(lambda a, b: a+b, [c.get_edge_cover() for c in covering_cycles])
        return counter_cardinality(graph_counter - coverage_counter)

def edge_coverability(graph: SwapGraph) -> float:
    """
    Returns a percentage indicating how much of the graph can be covered
    """
    graph_counter = graph.as_counter()
    covering_cycles = edge_covering_cycles(graph)
    if len(covering_cycles) == 0:
        return 0.0
    else:
        coverage_counter = reduce(lambda a, b: a+b, [c.get_edge_cover() for c in covering_cycles])
        return 1.0 - counter_cardinality(graph_counter - coverage_counter)/counter_cardinality(graph_counter)

# probably need to rewrite some functions as async for when called via the API