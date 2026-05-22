from collections import defaultdict
import numpy as np
from typing import Optional

class Trainer:
    def __init__(self, memory):
        self.memory = memory
    
    def predict_next_move(self) -> Optional[int]:
        if len(self.memory.moves) < 2:
            return self._frequency_prediction()
        
        return self._markov_prediction()
    
    def _frequency_prediction(self) -> Optional[int]:
        counts = self.memory.get_move_counts()
        if not counts:
            return None
        return max(counts, key=counts.get)
    
    def _markov_prediction(self) -> Optional[int]:
        if not self.memory.moves:
            return None
        
        last_move = self.memory.moves[-1]
        transitions = self.memory.transitions[last_move]
        
        if not transitions:
            return self._frequency_prediction()
        
        return max(transitions, key=transitions.get)
    
    def get_confidence(self) -> float:
        total = self.memory.total_moves()
        if total < 2:
            return 0.0
        
        if len(self.memory.moves) < 2:
            counts = self.memory.get_move_counts()
            if not counts:
                return 0.0
            max_count = max(counts.values())
            return min(max_count / total, 1.0)
        
        last_move = self.memory.moves[-1]
        transitions = self.memory.transitions[last_move]
        
        if not transitions:
            return 0.0
        
        total_transitions = sum(transitions.values())
        max_transition = max(transitions.values())
        return max_transition / total_transitions
