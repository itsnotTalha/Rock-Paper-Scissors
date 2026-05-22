import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import GameButtons from './GameButtons'
import Scoreboard from './Scoreboard'
import LearningMatrix from './LearningMatrix'
import AIPredictorDisplay from './AIPredictorDisplay'

export default function Dashboard() {
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [gameHistory, setGameHistory] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [predictedMove, setPredictedMove] = useState(null)
  const audioRef = useRef(null)

  const playSound = (type) => {
    const context = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    
    oscillator.connect(gain)
    gain.connect(context.destination)
    
    if (type === 'click') {
      oscillator.frequency.value = 800
      gain.gain.setValueAtTime(0.3, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1)
      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.1)
    } else if (type === 'win') {
      oscillator.frequency.setValueAtTime(523.25, context.currentTime)
      oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2)
      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.2)
    } else if (type === 'lose') {
      oscillator.frequency.setValueAtTime(400, context.currentTime)
      oscillator.frequency.setValueAtTime(300, context.currentTime + 0.1)
      gain.gain.setValueAtTime(0.3, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2)
      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.2)
    }
  }

  const handleMove = async (move) => {
    playSound('click')
    setIsThinking(true)
    try {
      const response = await fetch('/api/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_move: move })
      })
      const data = await response.json()
      
      playSound(data.result === 'win' ? 'win' : data.result === 'lose' ? 'lose' : 'click')
      
      setGameHistory(prev => [
        { playerMove: move, aiMove: data.ai_move, result: data.result },
        ...prev
      ])
      
      setPredictedMove(data.ai_move === 'rock' ? 0 : data.ai_move === 'paper' ? 1 : 2)
      
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
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Predictor Left */}
        <div className="lg:col-span-1">
          <AIPredictorDisplay 
            prediction={predictedMove}
            lastResult={gameHistory.length > 0 ? gameHistory[0].result : null}
            gameHistory={gameHistory}
          />
        </div>

        {/* Main Game Center */}
        <div className="lg:col-span-2">
          <div className="border-4 border-arcade-neon bg-arcade-dark rounded-lg p-8 glow-button-neon">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-arcade-neon text-2xl mb-2 arcade-title">ARCADE</h1>
              <motion.h2 
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-arcade-cyan text-sm tracking-widest"
              >
                ROCK PAPER SCISSORS AI
              </motion.h2>
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
                transition={{ type: 'spring', stiffness: 100 }}
                className="mt-8 p-4 bg-gray-900 rounded border-2 border-arcade-pink glow-button-pink text-center"
              >
                <p className="text-arcade-pink text-xs mb-2 tracking-widest">LAST MOVE</p>
                <p className="text-arcade-cyan text-sm font-bold">
                  {gameHistory[0].playerMove.toUpperCase()} vs {gameHistory[0].aiMove.toUpperCase()}
                </p>
                <motion.p
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  className={`text-lg font-black mt-2 ${
                    gameHistory[0].result === 'win' ? 'text-arcade-neon' :
                    gameHistory[0].result === 'lose' ? 'text-arcade-pink' :
                    'text-arcade-cyan'
                  }`}
                >
                  {gameHistory[0].result.toUpperCase()}
                </motion.p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Learning Matrix Right */}
        <div className="lg:col-span-1">
          <LearningMatrix gameHistory={gameHistory} />
        </div>
      </div>
    </motion.div>
  )
}
