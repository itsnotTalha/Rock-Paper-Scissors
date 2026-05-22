from typing import Optional, Tuple

class Predictor:
    def __init__(self, memory):
        self.memory = memory
    
    def predict_and_counter(self) -> Tuple[Optional[int], int, float]:
        predicted_move = self._predict_next_move()
        confidence = self._get_confidence()
        
        if predicted_move is None:
            counter_move = 0
        else:
            counter_move = self._get_counter_move(predicted_move)
        
        return predicted_move, counter_move, confidence
    
    def _predict_next_move(self) -> Optional[int]:
        last_two = self.memory.get_last_two_moves()
        
        if last_two is not None:
            transitions = self.memory.bigram_transitions.get(last_two, {})
            if transitions:
                return max(transitions, key=transitions.get)
        
        counts = self.memory.get_move_counts()
        if counts:
            return max(counts, key=counts.get)
        
        return None
    
    def _get_confidence(self) -> float:
        total = self.memory.total_moves()
        if total < 1:
            return 0.0
        
        last_two = self.memory.get_last_two_moves()
        
        if last_two is not None:
            transitions = self.memory.bigram_transitions.get(last_two, {})
            if transitions:
                total_transitions = sum(transitions.values())
                max_transition = max(transitions.values())
                return min(max_transition / total_transitions, 1.0)
        
        counts = self.memory.get_move_counts()
        if counts:
            max_count = max(counts.values())
            return min(max_count / total, 1.0)
        
        return 0.0
    
    def _get_counter_move(self, move: int) -> int:
        if move == 0:
            return 1
        elif move == 1:
            return 2
        else:
            return 0
