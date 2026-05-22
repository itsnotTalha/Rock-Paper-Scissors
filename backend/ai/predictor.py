from typing import Optional, Tuple
import math

class Predictor:
    def __init__(self, memory):
        self.memory = memory
        self.trigram_weight = 0.5
        self.bigram_weight = 0.35
        self.frequency_weight = 0.15
    
    def predict_and_counter(self) -> Tuple[Optional[int], int, float]:
        predicted_move = self._predict_next_move()
        confidence = self._get_confidence()
        
        if predicted_move is None:
            counter_move = 0
        else:
            counter_move = self._get_counter_move(predicted_move)
        
        return predicted_move, counter_move, confidence
    
    def _predict_next_move(self) -> Optional[int]:
        """Markov chain prediction using trigram, bigram, and frequency"""
        
        # Try trigram prediction first (last 3 moves)
        trigram_pred = self._trigram_prediction()
        if trigram_pred is not None:
            return trigram_pred
        
        # Fall back to bigram prediction (last 2 moves)
        bigram_pred = self._bigram_prediction()
        if bigram_pred is not None:
            return bigram_pred
        
        # Fall back to frequency
        frequency_pred = self._frequency_prediction()
        return frequency_pred
    
    def _trigram_prediction(self) -> Optional[int]:
        """Predict using last 3 moves (trigram)"""
        last_three = self.memory.get_last_three_moves()
        
        if last_three is not None:
            transitions = self.memory.trigram_transitions.get(last_three, {})
            if transitions:
                # Return move with highest frequency
                max_move = max(transitions, key=transitions.get)
                # Only return if pattern is relatively strong
                total = sum(transitions.values())
                if transitions[max_move] / total >= 0.3:
                    return max_move
        
        return None
    
    def _bigram_prediction(self) -> Optional[int]:
        """Predict using last 2 moves (bigram)"""
        last_two = self.memory.get_last_two_moves()
        
        if last_two is not None:
            transitions = self.memory.bigram_transitions.get(last_two, {})
            if transitions:
                # Return move with highest frequency
                return max(transitions, key=transitions.get)
        
        return None
    
    def _frequency_prediction(self) -> Optional[int]:
        """Predict using overall move frequency"""
        counts = self.memory.get_move_counts()
        if counts:
            return max(counts, key=counts.get)
        return None
    
    def _get_confidence(self) -> float:
        """Calculate confidence using Markov chain certainty"""
        
        # Trigram confidence
        last_three = self.memory.get_last_three_moves()
        if last_three is not None:
            transitions = self.memory.trigram_transitions.get(last_three, {})
            if transitions:
                total = sum(transitions.values())
                max_trans = max(transitions.values())
                trigram_conf = max_trans / total
                if trigram_conf >= 0.3:
                    return min(trigram_conf * 1.2, 1.0)
        
        # Bigram confidence
        last_two = self.memory.get_last_two_moves()
        if last_two is not None:
            transitions = self.memory.bigram_transitions.get(last_two, {})
            if transitions:
                total = sum(transitions.values())
                max_trans = max(transitions.values())
                bigram_conf = max_trans / total
                return min(bigram_conf, 1.0)
        
        # Frequency confidence
        total = self.memory.total_moves()
        if total < 1:
            return 0.0
        
        counts = self.memory.get_move_counts()
        if counts:
            max_count = max(counts.values())
            freq_conf = max_count / total
            return min(freq_conf * 0.8, 1.0)
        
        return 0.0
    
    def _get_counter_move(self, move: int) -> int:
        """Convert predicted move to counter move"""
        if move == 0:  # rock -> paper
            return 1
        elif move == 1:  # paper -> scissors
            return 2
        else:  # scissors -> rock
            return 0
