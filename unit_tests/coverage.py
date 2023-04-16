from graph.multiswap import MultiSwap, MultiSwapProtoGraph
from graph.graph import SwapGraph, Swap, edge_covering_cycles, edges_uncoverable
from timeit import default_timer as timer

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
        self.assertEqual(edges_uncoverable(self.graph), 0)
    
    def test_equivocal_solutions(self):
        """
        Fails if the algorithm for detecting edge covering cycles favours longer cycles
        Uses a simple triangle multidigraph where every edge is doubly connected with each other
        """
        self.graph = SwapGraph([Swap(*x) for x in [
            (1,2),
            (2,1),
            (2,3),
            (3,2),
            (3,1),
            (1,3),
        ]])
        self.covering_cycles = edge_covering_cycles(self.graph)
        self.assertEqual(len(self.covering_cycles), 3)

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
        start = timer()
        to_test = self.proto_graph.determine_optimal_configuration(iterlimit=100000)
        end = timer()
        print(f"Annealing time (100k iterations): {end-start}")
        self.assertTrue(to_test)
        start = timer()
        to_test = self.proto_graph.determine_optimal_configuration()
        end = timer()
        print(f"Annealing time (1m iterations): {end-start}")
        start = timer()
        to_test = self.proto_graph.determine_optimal_configuration(iterlimit=10000000)
        end = timer()
        print(f"Annealing time (10m iterations): {end-start}")