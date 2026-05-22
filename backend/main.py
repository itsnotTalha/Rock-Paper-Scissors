from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.game import router as game_router
from ai.memory import SessionMemory

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

session_memory = SessionMemory()

app.include_router(game_router, prefix="/api", tags=["game"])

@app.on_event("startup")
def startup():
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
