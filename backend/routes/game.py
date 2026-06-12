from fastapi import APIRouter, HTTPException
from models.moves import PlayRequest, PlayResponse, MOVE_MAP
from ai.predictor import Predictor
from ai.memory import SessionMemory

router = APIRouter()

session_memory = SessionMemory()
predictor = Predictor(session_memory)

def validate_move(move: str) -> int:
    if move not in MOVE_MAP:
        raise HTTPException(status_code=400, detail="Invalid move")
    return MOVE_MAP[move]

def get_result(player_move: int, ai_move: int) -> str:
    if player_move == ai_move:
        return "draw"
    if (player_move == 0 and ai_move == 2) or \
       (player_move == 1 and ai_move == 0) or \
       (player_move == 2 and ai_move == 1):
        return "win"
    return "lose"

@router.post("/play", response_model=PlayResponse)
def play(request: PlayRequest):
    player_move = validate_move(request.player_move)
    session_memory.add_move(player_move)
    
    # Train ML model after 15+ moves (need good data to start)
    if session_memory.total_moves() >= 15 and session_memory.total_moves() % 3 == 0:
        predictor.train()
    
    predicted_move, ai_move, confidence = predictor.predict_and_counter()
    result = get_result(player_move, ai_move)
    
    return PlayResponse(
        player_move=MOVE_MAP[player_move],
        ai_move=MOVE_MAP[ai_move],
        result=result,
        confidence=confidence
    )

@router.get("/stats")
def get_stats():
    bigram_data = {}
    for (move1, move2), transitions in session_memory.bigram_transitions.items():
        key = f"{move1},{move2}"
        bigram_data[key] = {str(k): v for k, v in transitions.items()}
    
    trigram_data = {}
    for (move1, move2, move3), transitions in session_memory.trigram_transitions.items():
        key = f"{move1},{move2},{move3}"
        trigram_data[key] = {str(k): v for k, v in transitions.items()}
    
    move_counts = {str(k): v for k, v in session_memory.get_move_counts().items()}
    
    return {
        "total_moves": session_memory.total_moves(),
        "move_counts": move_counts,
        "bigram_transitions": bigram_data,
        "trigram_transitions": trigram_data
    }

@router.get("/predict")
def get_prediction():
    """Get AI's prediction probabilities for all moves"""
    from ai.predictor import Predictor as PredictorClass
    predictor = PredictorClass(session_memory)
    
    predictions = {}
    last_three = session_memory.get_last_three_moves()
    last_two = session_memory.get_last_two_moves()
    
    # Get trigram probabilities
    trigram_probs = {}
    if last_three is not None:
        transitions = session_memory.trigram_transitions.get(last_three, {})
        if transitions:
            total = sum(transitions.values())
            for move in range(3):
                trigram_probs[move] = transitions.get(move, 0) / total if total > 0 else 0
    
    # Get bigram probabilities
    bigram_probs = {}
    if last_two is not None:
        transitions = session_memory.bigram_transitions.get(last_two, {})
        if transitions:
            total = sum(transitions.values())
            for move in range(3):
                bigram_probs[move] = transitions.get(move, 0) / total if total > 0 else 0
    
    # Get frequency probabilities
    freq_probs = {}
    counts = session_memory.get_move_counts()
    total = session_memory.total_moves()
    for move in range(3):
        freq_probs[move] = counts.get(move, 0) / total if total > 0 else 0
    
    # Combined prediction
    predicted_move, counter_move, confidence = predictor.predict_and_counter()
    
    return {
        "predicted_move": predicted_move if predicted_move is not None else 0,
        "counter_move": counter_move,
        "confidence": confidence,
        "trigram_probabilities": trigram_probs,
        "bigram_probabilities": bigram_probs,
        "frequency_probabilities": freq_probs,
        "total_moves": total
    }

