from typing import Optional, Tuple
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

class Predictor:
    def __init__(self, memory):
        self.memory = memory
        self.ml_model = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            max_iter=2000,
            learning_rate_init=0.001,
            alpha=0.0001,
            random_state=42,
            warm_start=True,
            early_stopping=False,
            batch_size=32
        )
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def predict_and_counter(self) -> Tuple[Optional[int], int, float]:
        predicted_move = self._predict_next_move()
        confidence = self._get_confidence()
        
        if predicted_move is None:
            counter_move = 0
        else:
            counter_move = self._get_counter_move(predicted_move)
        
        return predicted_move, counter_move, confidence
    
    def _predict_next_move(self) -> Optional[int]:
        """Hybrid prediction: ML + Markov chain with adaptive weighting"""
        
        # Get predictions and their confidences
        ml_pred, ml_conf = self._ml_prediction()
        trigram_pred, trigram_conf = self._trigram_prediction()
        bigram_pred, bigram_conf = self._bigram_prediction()
        freq_pred, freq_conf = self._frequency_prediction()
        
        # Weighted ensemble with confidence-based weighting
        predictions = {}
        
        if trigram_pred is not None and trigram_conf > 0:
            weight = min(trigram_conf * 0.4, 0.4)
            predictions[trigram_pred] = predictions.get(trigram_pred, 0) + weight
        
        if bigram_pred is not None and bigram_conf > 0:
            weight = min(bigram_conf * 0.35, 0.35)
            predictions[bigram_pred] = predictions.get(bigram_pred, 0) + weight
        
        if ml_pred is not None and ml_conf > 0 and self.is_trained:
            weight = min(ml_conf * 0.25, 0.25)
            predictions[ml_pred] = predictions.get(ml_pred, 0) + weight
        
        if freq_pred is not None and freq_conf > 0:
            weight = min(freq_conf * 0.15, 0.15)
            predictions[freq_pred] = predictions.get(freq_pred, 0) + weight
        
        if predictions:
            return max(predictions, key=predictions.get)
        
        return None
    
    def _ml_prediction(self) -> Tuple[Optional[int], float]:
        """Neural network prediction using scikit-learn MLPClassifier"""
        if not self.is_trained or len(self.memory.moves) < 3:
            return None, 0.0
        
        try:
            last_three = self.memory.get_last_three_moves()
            if last_three is None:
                return None, 0.0
            
            X_new = np.array([last_three])
            X_scaled = self.scaler.transform(X_new)
            probas = self.ml_model.predict_proba(X_scaled)[0]
            
            pred = int(np.argmax(probas))
            confidence = float(probas[pred])
            
            return pred, confidence
        except:
            return None, 0.0
    
    def _trigram_prediction(self) -> Tuple[Optional[int], float]:
        """Predict using last 3 moves (trigram)"""
        last_three = self.memory.get_last_three_moves()
        
        if last_three is not None:
            transitions = self.memory.trigram_transitions.get(last_three, {})
            if transitions:
                total = sum(transitions.values())
                max_move = max(transitions, key=transitions.get)
                confidence = transitions[max_move] / total
                return max_move, confidence
        
        return None, 0.0
    
    def _bigram_prediction(self) -> Tuple[Optional[int], float]:
        """Predict using last 2 moves (bigram)"""
        last_two = self.memory.get_last_two_moves()
        
        if last_two is not None:
            transitions = self.memory.bigram_transitions.get(last_two, {})
            if transitions:
                total = sum(transitions.values())
                max_move = max(transitions, key=transitions.get)
                confidence = transitions[max_move] / total
                return max_move, confidence
        
        return None, 0.0
    
    def _frequency_prediction(self) -> Tuple[Optional[int], float]:
        """Predict using overall move frequency"""
        counts = self.memory.get_move_counts()
        if counts:
            total = sum(counts.values())
            max_move = max(counts, key=counts.get)
            confidence = counts[max_move] / total
            return max_move, confidence
        
        return None, 0.0
    
    def train(self):
        """Train the neural network on collected data"""
        X, y = self.memory.get_training_data()
        
        if len(X) < 15:  # Need minimum 15 samples for good training
            return
        
        try:
            # Fit scaler if first time
            if not self.is_trained:
                self.scaler.fit(X)
            
            X_scaled = self.scaler.transform(X)
            
            # Incremental training (warm_start=True)
            if not self.is_trained:
                self.ml_model.fit(X_scaled, y)
                self.is_trained = True
            else:
                # Use partial_fit for incremental learning
                self.ml_model.partial_fit(X_scaled, y, classes=np.array([0, 1, 2]))
        except Exception as e:
            print(f"Training error: {e}")
    
    def _get_confidence(self) -> float:
        """Calculate confidence from best predictor"""
        
        # ML confidence (only if trained well)
        if self.is_trained and len(self.memory.moves) > 20:
            ml_conf = self._get_ml_confidence()
            if ml_conf >= 0.4:
                return min(ml_conf, 1.0)
        
        # Trigram confidence
        last_three = self.memory.get_last_three_moves()
        if last_three is not None:
            transitions = self.memory.trigram_transitions.get(last_three, {})
            if transitions:
                total = sum(transitions.values())
                max_trans = max(transitions.values())
                trigram_conf = max_trans / total
                if trigram_conf >= 0.25:
                    return min(trigram_conf, 1.0)
        
        # Bigram confidence
        last_two = self.memory.get_last_two_moves()
        if last_two is not None:
            transitions = self.memory.bigram_transitions.get(last_two, {})
            if transitions:
                total = sum(transitions.values())
                max_trans = max(transitions.values())
                bigram_conf = max_trans / total
                if bigram_conf >= 0.25:
                    return min(bigram_conf * 0.95, 1.0)
        
        # Frequency confidence
        total = self.memory.total_moves()
        if total < 1:
            return 0.0
        
        counts = self.memory.get_move_counts()
        if counts:
            max_count = max(counts.values())
            freq_conf = max_count / total
            return min(freq_conf * 0.7, 1.0)
        
        return 0.0
    
    def _get_ml_confidence(self) -> float:
        """Get confidence from neural network"""
        if not self.is_trained:
            return 0.0
        
        try:
            last_three = self.memory.get_last_three_moves()
            if last_three is None:
                return 0.0
            
            X_new = np.array([last_three])
            X_scaled = self.scaler.transform(X_new)
            probas = self.ml_model.predict_proba(X_scaled)[0]
            return float(max(probas))
        except:
            return 0.0
    
    def _get_counter_move(self, move: int) -> int:
        """Convert predicted move to counter move"""
        if move == 0:  # rock -> paper
            return 1
        elif move == 1:  # paper -> scissors
            return 2
        else:  # scissors -> rock
            return 0
