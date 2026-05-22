import { motion } from 'framer-motion'

const scoreVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 200, damping: 15 }
}

export default function Scoreboard({ playerScore, aiScore }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="p-4 bg-gray-900 rounded border-3 border-arcade-neon glow-button-neon text-center"
      >
        <p className="text-arcade-neon text-xs mb-2 tracking-widest font-bold">PLAYER</p>
        <motion.p
          key={playerScore}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-arcade-neon text-5xl font-black"
        >
          {playerScore}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="p-4 bg-gray-900 rounded border-3 border-arcade-cyan glow-button-cyan text-center"
      >
        <p className="text-arcade-cyan text-xs mb-2 tracking-widest font-bold">A.I.</p>
        <motion.p
          key={aiScore}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-arcade-cyan text-5xl font-black"
        >
          {aiScore}
        </motion.p>
      </motion.div>
    </div>
  )
}
