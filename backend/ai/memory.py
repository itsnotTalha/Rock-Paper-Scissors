from collections import defaultdict
from typing import List, Dict, Tuple, Optional

class SessionMemory:
    def __init__(self):
        self.moves = []
        self.bigram_transitions = defaultdict(lambda: defaultdict(int))
        self.move_counts = defaultdict(int)
    
    def add_move(self, move: int):
        if len(self.moves) >= 2:
            prev_two = (self.moves[-2], self.moves[-1])
            self.bigram_transitions[prev_two][move] += 1
        self.moves.append(move)
        self.move_counts[move] += 1
    
    def get_last_two_moves(self) -> Optional[Tuple[int, int]]:
        if len(self.moves) >= 2:
            return (self.moves[-2], self.moves[-1])
        return None
    
    def get_move_sequence(self) -> List[int]:
        return self.moves.copy()
    
    def get_bigram_transitions(self) -> Dict:
        return dict(self.bigram_transitions)
    
    def get_move_counts(self) -> Dict:
        return dict(self.move_counts)
    
    def total_moves(self) -> int:
        return len(self.moves)
