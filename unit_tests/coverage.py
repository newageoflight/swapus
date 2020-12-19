from graph.multiswap import MultiSwap, MultiSwapProtoGraph
from graph.graph import SwapGraph, Swap, edge_covering_cycles, edges_uncoverable

import unittest

class TestSingleWantCoverage(unittest.TestCase):
    def setUp(self):
        self.graph = SwapGraph([Swap(*x) for x in [
            (5, 2, {"name": "Malin"}),
            (5, 2, {"name": "Sophie"}),
            (3, 2, {"name": "Mel"}),
            (4, 2, {"name": "Liv"}),
            (4, 3, {"name": "Em"}),
            (2, 4, {"name": "Haris"}),
            (2, 4, {"name": "Shree"}),
            (2, 5, {"name": "Chris"}),
            (2, 5, {"name": "Nima"})
        ]])
        self.covering_cycles = edge_covering_cycles(self.graph)

    def test_single_want(self):
        self.assertTrue(self.covering_cycles)

    def test_single_want_suggestions(self):
        self.assertTrue(self.graph.suggest_swaps(self.covering_cycles))

    def test_fully_coverable(self):
        self.assertEquals(edges_uncoverable(self.graph), 0)

class TestMultipleWantCoverage(unittest.TestCase):
    def setUp(self):
        self.proto_graph = MultiSwapProtoGraph([MultiSwap(*x) for x in [
            (2, [1,5,6], {"name": "Chris"}),
            (7, [4,6], {"name": "Nur"}),
            (4, [6], {"name": "Audrey"}),
            (8, [1], {"name": "Alvin"}),
            (4, [1], {"name": "Michael"}),
            (7, [1,2,3,5,6], {"name": "Nathan"}),
            (3, [5], {"name": "Xin"}),
            (7, [1,3,5], {"name": "Maggie"}),
            (2, [1,3,4,5,6,7,8], {"name": "Riley"}),
            (6, [1,8], {"name": "Steph"}),
            (3, [8], {"name": "Nivi"}),
            (6, [3,4,8], {"name": "Alex"}),
            (2, [4,6], {"name": "Jun"}),
        ]])

    def test_anneal_configurations(self):
        self.assertTrue(self.proto_graph.anneal_configurations())