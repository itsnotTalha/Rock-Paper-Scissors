import { useState } from 'react'
import { motion } from 'framer-motion'
import GameButtons from './GameButtons'
import Scoreboard from './Scoreboard'

export default function Dashboard() {
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [gameHistory, setGameHistory] = useState([])
  const [isThinking, setIsThinking] = useState(false)

  const handleMove = async (move) => {
    setIsThinking(true)
    try {
      const response = await fetch('/api/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_move: move })
      })
      const data = await response.json()
      
      setGameHistory(prev => [
        { playerMove: move, aiMove: data.ai_move, result: data.result },
        ...prev
      ])
      
      if (data.result === 'win') setPlayerScore(prev => prev + 1)
      else if (data.result === 'lose') setAiScore(prev => prev + 1)
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl"
    >
      <div className="border-4 border-arcade-neon bg-arcade-dark rounded-lg p-8 shadow-glow">
        {/* Header */}
        <div className="text-center mb-8 animate-pulse">
          <h1 className="text-arcade-neon text-2xl mb-2">ARCADE</h1>
          <h2 className="text-arcade-cyan text-sm">ROCK PAPER SCISSORS AI</h2>
        </div>

        {/* Scoreboard */}
        <Scoreboard playerScore={playerScore} aiScore={aiScore} />

        {/* Game Buttons */}
        <GameButtons onMove={handleMove} isThinking={isThinking} />

        {/* Last Move */}
        {gameHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-gray-900 rounded border-2 border-arcade-pink text-center"
          >
            <p className="text-arcade-pink text-xs mb-2">LAST MOVE</p>
            <p className="text-arcade-cyan text-sm">
              You: {gameHistory[0].playerMove.toUpperCase()} | 
              AI: {gameHistory[0].aiMove.toUpperCase()} | 
              {gameHistory[0].result.toUpperCase()}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
