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
    return {
        "total_moves": session_memory.total_moves(),
        "move_counts": session_memory.get_move_counts(),
        "bigram_transitions": session_memory.get_bigram_transitions()
    }

@router.post("/reset")
def reset_session():
    global session_memory, predictor
    session_memory = SessionMemory()
    predictor = Predictor(session_memory)
    return {"status": "session reset"}
