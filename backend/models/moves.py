from enum import Enum
from pydantic import BaseModel

class Move(str, Enum):
    ROCK = "rock"
    PAPER = "paper"
    SCISSORS = "scissors"

MOVE_MAP = {
    "rock": 0,
    "paper": 1,
    "scissors": 2,
    0: "rock",
    1: "paper",
    2: "scissors"
}

class PlayRequest(BaseModel):
    player_move: str

class PlayResponse(BaseModel):
    player_move: str
    ai_move: str
    result: str
    confidence: float = 0.5
