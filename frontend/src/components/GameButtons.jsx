import { motion } from 'framer-motion'

const MOVES = [
  { name: 'rock', icon: '✊', color: 'neon', glowColor: 'glow' },
  { name: 'paper', icon: '✋', color: 'cyan', glowColor: 'glow-cyan' },
  { name: 'scissors', icon: '✌️', color: 'pink', glowColor: 'glow-pink' }
]

export default function GameButtons({ onMove, isThinking }) {
  return (
    <div className="grid grid-cols-3 gap-4 my-8">
      {MOVES.map(move => (
        <motion.button
          key={move.name}
          onClick={() => onMove(move.name)}
          disabled={isThinking}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            p-6 rounded-lg bg-gray-900 border-3
            border-arcade-${move.color} text-arcade-${move.color}
            text-4xl shadow-${move.glowColor}
            hover:shadow-${move.glowColor} transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            text-xs mt-2 font-arcade
          `}
        >
          <div className="text-3xl mb-2">{move.icon}</div>
          {move.name}
        </motion.button>
      ))}
    </div>
  )
}
