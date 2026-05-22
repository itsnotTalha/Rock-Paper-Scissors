import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const MOVES = {
  0: { name: 'ROCK', icon: '✊', color: 'arcade-neon' },
  1: { name: 'PAPER', icon: '✋', color: 'arcade-cyan' },
  2: { name: 'SCISSORS', icon: '✌️', color: 'arcade-pink' }
}

const GLOW_CLASSES = {
  'arcade-neon': 'glow-button-neon',
  'arcade-cyan': 'glow-button-cyan',
  'arcade-pink': 'glow-button-pink'
}

export default function AIPredictorDisplay({ prediction, lastResult, gameHistory }) {
  const [displayPrediction, setDisplayPrediction] = useState(null)
  const [predictions, setPredictions] = useState({
    predicted_move: null,
    confidence: 0,
    trigram_probabilities: {},
    bigram_probabilities: {},
    frequency_probabilities: {}
  })

  useEffect(() => {
    if (prediction !== null && prediction !== undefined) {
      setDisplayPrediction(prediction)
    }
  }, [prediction])

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch('/api/predict')
        const data = await response.json()
        setPredictions(data)
      } catch (error) {
        console.error('Failed to fetch predictions:', error)
      }
    }

    fetchPredictions()
  }, [gameHistory])

  const move = displayPrediction !== null ? MOVES[displayPrediction] : null

  // Get the highest probability for each strategy
  const getHighestProb = (probs) => {
    if (!probs || Object.keys(probs).length === 0) return 0
    return Math.max(...Object.values(probs).map(p => parseFloat(p) || 0))
  }

  const trigramMax = getHighestProb(predictions.trigram_probabilities)
  const bigramMax = getHighestProb(predictions.bigram_probabilities)
  const frequencyMax = getHighestProb(predictions.frequency_probabilities)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="border-4 border-arcade-neon bg-arcade-dark rounded-lg p-4 glow-button-neon h-full flex flex-col space-y-4"
    >
      {/* Header */}
      <div className="text-center">
        <motion.h3
          animate={{ opacity: [0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-arcade-neon text-xs font-bold tracking-widest"
        >
          AI ANALYSIS
        </motion.h3>
      </div>

      {/* Main Prediction */}
      <div className="bg-gray-900 rounded border-3 border-arcade-neon p-3">
        <p className="text-arcade-neon text-[9px] font-bold mb-2 tracking-widest">PREDICTED MOVE</p>
        {move ? (
          <motion.div
            key={displayPrediction}
            initial={{ scale: 0.5, opacity: 0, rotateZ: -180 }}
            animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className={`
              flex flex-col items-center
              p-4 rounded
              border-2 border-${move.color}
              bg-gray-800
            `}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`text-5xl mb-2 text-${move.color}`}
            >
              {move.icon}
            </motion.div>
            <div className={`text-${move.color} text-xs font-black`}>
              {move.name}
            </div>
          </motion.div>
        ) : (
          <p className="text-arcade-cyan text-[9px] text-center">ANALYZING...</p>
        )}
      </div>

      {/* Confidence */}
      <div className="bg-gray-900 rounded border-2 border-arcade-pink p-2">
        <p className="text-arcade-pink text-[8px] font-bold mb-1">CONFIDENCE</p>
        <motion.div
          className="h-2 bg-arcade-pink rounded"
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(predictions.confidence * 100)}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        />
        <p className="text-arcade-pink text-[9px] font-black mt-1 text-right">
          {Math.round(predictions.confidence * 100)}%
        </p>
      </div>

      {/* Strategy Breakdown */}
      <div className="text-[8px] space-y-2">
        <p className="text-arcade-cyan font-bold tracking-widest">STRATEGIES</p>
        
        {/* Trigram */}
        {trigramMax > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 p-1.5 rounded border border-arcade-cyan"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-arcade-neon font-bold">TRIGRAM</span>
              <span className="text-arcade-cyan font-black">{Math.round(trigramMax * 100)}%</span>
            </div>
            <div className="h-1 bg-arcade-cyan rounded w-full" style={{ width: `${trigramMax * 100}%` }} />
          </motion.div>
        )}

        {/* Bigram */}
        {bigramMax > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 p-1.5 rounded border border-arcade-cyan"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-arcade-neon font-bold">BIGRAM</span>
              <span className="text-arcade-cyan font-black">{Math.round(bigramMax * 100)}%</span>
            </div>
            <div className="h-1 bg-arcade-cyan rounded" style={{ width: `${bigramMax * 100}%` }} />
          </motion.div>
        )}

        {/* Frequency */}
        {frequencyMax > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-1.5 rounded border border-arcade-cyan"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-arcade-neon font-bold">FREQ</span>
              <span className="text-arcade-cyan font-black">{Math.round(frequencyMax * 100)}%</span>
            </div>
            <div className="h-1 bg-arcade-cyan rounded" style={{ width: `${frequencyMax * 100}%` }} />
          </motion.div>
        )}
      </div>

      {/* Move Probabilities */}
      <div className="bg-gray-900 rounded border-2 border-arcade-cyan p-2">
        <p className="text-arcade-cyan text-[8px] font-bold mb-2 tracking-widest">NEXT MOVES</p>
        <div className="space-y-1">
          {[0, 1, 2].map(moveId => {
            const prob = predictions.frequency_probabilities[moveId] || 0
            const moveInfo = MOVES[moveId]
            return (
              <motion.div
                key={moveId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: moveId * 0.05 }}
                className="flex items-center gap-1 text-[7px]"
              >
                <span className="text-white w-4">{moveInfo.icon}</span>
                <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden border border-gray-600">
                  <motion.div
                    className={`h-full bg-${moveInfo.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${prob * 100}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  />
                </div>
                <span className={`text-${moveInfo.color} font-black w-6 text-right`}>
                  {Math.round(prob * 100)}%
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Last Result */}
      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            rounded border-2 p-2 text-center text-[8px] font-bold
            ${
              lastResult === 'win'
                ? 'border-arcade-neon bg-gray-800 text-arcade-neon'
                : lastResult === 'lose'
                ? 'border-arcade-pink bg-gray-800 text-arcade-pink'
                : 'border-arcade-cyan bg-gray-800 text-arcade-cyan'
            }
          `}
        >
          {lastResult === 'win'
            ? '✓ AI WON'
            : lastResult === 'lose'
            ? '✓ PLAYER WON'
            : '◆ DRAW'}
        </motion.div>
      )}
    </motion.div>
  )
}

