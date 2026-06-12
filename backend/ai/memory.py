from collections import defaultdict
from typing import List, Dict, Tuple, Optional
import numpy as np

class SessionMemory:
    def __init__(self):
        self.moves = []
        self.bigram_transitions = defaultdict(lambda: defaultdict(int))
        self.trigram_transitions = defaultdict(lambda: defaultdict(int))
        self.move_counts = defaultdict(int)
        self.recency_weights = []
        
        # ML training data
        self.X_train = []  # Input sequences (last 3 moves)
        self.y_train = []  # Next move
    
    def add_move(self, move: int):
        # Track bigrams (last 2 moves)
        if len(self.moves) >= 2:
            prev_two = (self.moves[-2], self.moves[-1])
            self.bigram_transitions[prev_two][move] += 1
        
        # Track trigrams (last 3 moves)
        if len(self.moves) >= 3:
            prev_three = (self.moves[-3], self.moves[-2], self.moves[-1])
            self.trigram_transitions[prev_three][move] += 1
            
            # Add to ML training data
            self.X_train.append([self.moves[-3], self.moves[-2], self.moves[-1]])
            self.y_train.append(move)
        
        self.moves.append(move)
        self.move_counts[move] += 1
        self.recency_weights.append(1.0)
    
    def get_last_two_moves(self) -> Optional[Tuple[int, int]]:
        if len(self.moves) >= 2:
            return (self.moves[-2], self.moves[-1])
        return None
    
    def get_last_three_moves(self) -> Optional[Tuple[int, int, int]]:
        if len(self.moves) >= 3:
            return (self.moves[-3], self.moves[-2], self.moves[-1])
        return None
    
    def get_move_sequence(self) -> List[int]:
        return self.moves.copy()
    
    def get_bigram_transitions(self) -> Dict:
        return dict(self.bigram_transitions)
    
    def get_trigram_transitions(self) -> Dict:
        return dict(self.trigram_transitions)
    
    def get_move_counts(self) -> Dict:
        return dict(self.move_counts)
    
    def get_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Return training data as numpy arrays"""
        if len(self.X_train) < 2:
            return np.array([]), np.array([])
        return np.array(self.X_train), np.array(self.y_train)
    
    def total_moves(self) -> int:
        return len(self.moves)
