# unit tests
# import unittest
from graph.graph import Swap, SwapGraph, edge_covering_cycles

if __name__ == "__main__":
    my_graph = SwapGraph([Swap(*x) for x in [
        (5, 2, "Malin"),
        (5, 2, "Sophie"),
        (3, 2, "Mel"),
        (4, 2, "Liv"),
        (4, 3, "Em"),
        (2, 4, "Haris"),
        (2, 4, "Shree"),
        (2, 5, "Chris"),
        (2, 5, "Nima")
    ]])
    covering = edge_covering_cycles(my_graph)
    print(my_graph.suggest_swaps(covering))