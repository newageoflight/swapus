from dataclasses import dataclass, field
from functools import reduce
from graph.multiswap_utils import get_coverability
from multiprocessing.pool import Pool 
from typing import List, Optional

from utils import uniq
from .graph import Swap, SwapGraph, edges_uncoverable, edge_coverability

import math
import networkx as nx
import numpy as np
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
        uncoverable_log = np.empty((0,2), np.int32)
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
            uncoverable_log = np.append(uncoverable_log, np.array([[uncoverable_current, min_uncoverable]], np.int32), axis=0)
        return SwapGraph(best_state)
    
    def genetic_configuration(self, itercount=1000, starting_population_size=100, mutation_rate=0.1):
        """
        Uses a genetic algorithm to figure out the optimal configuration
        """
        usable_swaps = self.swaps.copy()
        pool = Pool()
        # create initial conditions first
        current_generation = []
        current_population_fitness = []
        # create starting population
        starting_population = [np.array([Swap(s.have, random.choice(s.want), s.data) for s in usable_swaps], dtype=np.object) for i in range(starting_population_size)]
        current_generation = starting_population
        # calculate current generation's fitness
        current_population_fitness = pool.map(get_coverability, current_generation)
        # print(max(current_population_fitness))
        for i in range(itercount):
            # current_population_fitness = [edge_coverability(SwapGraph(p)) for p in current_generation]
            # kill anyone whose fitness is zero
            remaining_population = [p for i, p in enumerate(starting_population) if current_population_fitness[i] > 0]
            # create the next generations
            # assume completely random mating
            # assume the next generation is of equal size to the parent generation
            # pick_parents = lambda i: np.random.choice(len(remaining_population), 2)
            # mating_pairs = pool.map(pick_parents, range(starting_population_size))
            mating_pairs = [np.random.choice(len(remaining_population), 2) for i in range(starting_population_size)]
            next_generation = []
            # pick two parents
            for parent1_index, parent2_index in mating_pairs:
                parent1 = remaining_population[parent1_index]
                parent2 = remaining_population[parent2_index]
                # each child inherits half their traits from each parent
                selection_indices = np.random.choice(len(usable_swaps), len(usable_swaps)//2)
                selection_complement = np.setdiff1d(np.arange(len(usable_swaps)), selection_indices)
                parent1_traits = parent1[selection_indices]
                parent2_traits = parent2[selection_complement]
                child = np.empty(len(usable_swaps), dtype=np.object)
                child[selection_indices] = parent1_traits
                child[selection_complement] = parent2_traits
                # probabilistically introduce a mutation
                if random.random() >= 1 - mutation_rate:
                    # pick a random edge to change
                    index_to_change = random.choice([i for i, s in enumerate(usable_swaps) if len(s.want) > 1])
                    replacement_item = usable_swaps[index_to_change]
                    child[index_to_change] = Swap(replacement_item.have, random.choice(replacement_item.want), replacement_item.data)
                next_generation.append(child)
            current_generation = next_generation
            current_population_fitness = pool.map(get_coverability, current_generation)
            # print(max(current_population_fitness))
        fittest_member = np.argmax(current_population_fitness)
        return SwapGraph(current_generation[fittest_member])