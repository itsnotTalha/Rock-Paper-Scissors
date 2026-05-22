import { motion } from 'framer-motion'

const MOVES = [
  { name: 'rock', icon: '✊', color: 'neon', glowClass: 'glow-button-neon' },
  { name: 'paper', icon: '✋', color: 'cyan', glowClass: 'glow-button-cyan' },
  { name: 'scissors', icon: '✌️', color: 'pink', glowClass: 'glow-button-pink' }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 10 },
  },
}

export default function GameButtons({ onMove, isThinking }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-4 my-8"
    >
      {MOVES.map(move => (
        <motion.button
          key={move.name}
          variants={itemVariants}
          onClick={() => onMove(move.name)}
          disabled={isThinking}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className={`
            p-6 rounded-lg bg-gray-900 border-4
            border-arcade-${move.color} text-arcade-${move.color}
            text-4xl ${move.glowClass}
            disabled:opacity-50 disabled:cursor-not-allowed
            text-xs mt-2 font-arcade font-bold
            transition-all duration-100
            hover:border-[6px]
          `}
        >
          <div className="text-3xl mb-2">{move.icon}</div>
          <motion.div
            animate={isThinking ? { opacity: 0.5 } : { opacity: 1 }}
          >
            {move.name}
          </motion.div>
        </motion.button>
      ))}
    </motion.div>
  )
}
