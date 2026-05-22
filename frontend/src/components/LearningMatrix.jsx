import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function LearningMatrix({ gameHistory }) {
  const [stats, setStats] = useState({
    total_moves: 0,
    move_counts: {},
    bigram_transitions: {}
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [gameHistory])

  const moveNames = { 0: 'ROCK', 1: 'PAPER', 2: 'SCISSORS' }
  const moveColors = { 0: 'arcade-neon', 1: 'arcade-cyan', 2: 'arcade-pink' }
  
  const maxCount = Math.max(...Object.values(stats.move_counts), 1)
  const totalTransitions = Object.values(stats.bigram_transitions).reduce(
    (sum, transitions) => sum + Object.values(transitions).reduce((a, b) => a + b, 0),
    0
  )

  const getFrequencyPercentage = (move) => {
    if (stats.total_moves === 0) return 0
    const count = stats.move_counts[move] || stats.move_counts[String(move)] || 0
    return Math.round((count / stats.total_moves) * 100)
  }

  const getConfidence = () => {
    if (stats.total_moves < 2) return 0
    if (totalTransitions === 0) return 0
    try {
      const allTransitions = Object.values(stats.bigram_transitions).flatMap(t => Object.values(t))
      if (allTransitions.length === 0) return 0
      const maxTransitions = Math.max(...allTransitions)
      return Math.round((maxTransitions / totalTransitions) * 100)
    } catch (e) {
      return 0
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="border-4 border-arcade-cyan bg-arcade-dark rounded-lg p-4 glow-button-cyan h-full"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <motion.h3
          animate={{ opacity: [0.7, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-arcade-cyan text-xs font-bold tracking-widest"
        >
          LEARNING MATRIX
        </motion.h3>
      </div>

      {/* Total Moves */}
      <div className="bg-gray-900 rounded border-2 border-arcade-neon p-2 mb-4">
        <p className="text-arcade-neon text-[10px] font-bold">MOVES</p>
        <motion.p
          key={stats.total_moves}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-arcade-neon text-lg font-black"
        >
          {stats.total_moves}
        </motion.p>
      </div>

      {/* Frequency Distribution */}
      <div className="mb-4">
        <p className="text-arcade-cyan text-[9px] font-bold mb-2 tracking-widest">FREQUENCY</p>
        {[0, 1, 2].map((move) => (
          <div key={move} className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] text-arcade-neon font-bold">{moveNames[move]}</span>
              <span className={`text-[8px] font-bold text-arcade-${moveColors[move]}`}>
                {getFrequencyPercentage(move)}%
              </span>
            </div>
            <motion.div
              className={`h-1 bg-arcade-${moveColors[move]} rounded border-1 border-arcade-${moveColors[move]}`}
              initial={{ width: 0 }}
              animate={{
                width: `${(getFrequencyPercentage(move))}%`,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
        ))}
      </div>

      {/* Confidence Meter */}
      <div className="bg-gray-900 rounded border-2 border-arcade-pink p-2 mb-4">
        <p className="text-arcade-pink text-[9px] font-bold mb-1 tracking-widest">CONFIDENCE</p>
        <div className="flex items-center gap-2">
          <motion.div
            className="h-2 bg-arcade-pink rounded flex-1"
            initial={{ width: 0 }}
            animate={{
              width: `${getConfidence()}%`,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
          <span className="text-arcade-pink text-[10px] font-bold w-8 text-right">
            {getConfidence()}%
          </span>
        </div>
      </div>

      {/* Bigram Patterns */}
      <div className="text-[8px]">
        <p className="text-arcade-cyan font-bold mb-2 tracking-widest">PATTERNS</p>
        <div className="space-y-1 max-h-24 overflow-y-auto">
          {Object.entries(stats.bigram_transitions).slice(0, 6).map(([bigram, transitions]) => {
            try {
              const [prev1, prev2] = bigram.split(',').map(Number)
              const predictedMove = Object.keys(transitions).length > 0
                ? Object.entries(transitions).sort(([, a], [, b]) => b - a)[0][0]
                : null
              const count = Object.values(transitions).reduce((a, b) => a + b, 0)
              
              if (count === 0) return null
              
              return (
                <motion.div
                  key={bigram}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-800 p-1 rounded border-1 border-arcade-cyan text-[7px]"
                >
                  <div className="text-arcade-cyan font-bold">
                    {moveNames[prev1]} → {moveNames[prev2]} → {predictedMove !== null ? moveNames[predictedMove] : '?'}
                  </div>
                  <div className="text-arcade-neon">{count}x</div>
                </motion.div>
              )
            } catch (e) {
              return null
            }
          })}
        </div>
      </div>

      {/* Status Indicator */}
      <motion.div
        animate={{ opacity: [0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="mt-4 text-center text-[8px] text-arcade-neon font-bold tracking-widest"
      >
        {stats.total_moves < 3 ? '▪ INITIALIZING' : '▪ LEARNING'}
      </motion.div>
    </motion.div>
  )
}
