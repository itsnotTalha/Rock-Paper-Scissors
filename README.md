# Rock Paper Scissors AI - Arcade Game

## Quick Start

### macOS/Linux
```bash
./launch.sh
```

### Windows
```bash
launch.bat
```

The launcher will:
1. Create virtual environments if needed
2. Install dependencies automatically
3. Start both backend and frontend servers
4. Print the game URL to open in your browser

**URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

---

## Manual Start (Alternative)

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python3 main.py
```

### Frontend (in another terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
Rock-Paper-Scissors/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GameButtons.jsx
│   │   │   ├── Scoreboard.jsx
│   │   │   ├── AIPredictorDisplay.jsx
│   │   │   └── LearningMatrix.jsx
│   │   └── App.jsx
│   └── package.json
├── backend/               # FastAPI server
│   ├── main.py
│   ├── routes/
│   │   └── game.py
│   ├── ai/
│   │   ├── predictor.py
│   │   ├── trainer.py
│   │   └── memory.py
│   ├── models/
│   │   └── moves.py
│   └── requirements.txt
├── launch.sh              # macOS/Linux launcher
└── launch.bat             # Windows launcher
```
