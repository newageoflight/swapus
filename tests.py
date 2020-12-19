from graph.multiswap import MultiSwapProtoGraph, MultiSwap
# from unit_tests.coverage import TestSingleWantCoverage, TestMultipleWantCoverage

# import unittest

if __name__ == "__main__":
    # unittest.main()
    proto_graph = MultiSwapProtoGraph([MultiSwap(*x) for x in [
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
    anneal_config = proto_graph.anneal_configurations()
    genetic_config = proto_graph.genetic_configuration()