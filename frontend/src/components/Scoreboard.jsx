import { motion } from 'framer-motion'

export default function Scoreboard({ playerScore, aiScore }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="p-4 bg-gray-900 rounded border-2 border-arcade-neon text-center"
      >
        <p className="text-arcade-neon text-xs mb-2">PLAYER</p>
        <p className="text-arcade-neon text-4xl font-bold">{playerScore}</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="p-4 bg-gray-900 rounded border-2 border-arcade-cyan text-center"
      >
        <p className="text-arcade-cyan text-xs mb-2">AI</p>
        <p className="text-arcade-cyan text-4xl font-bold">{aiScore}</p>
      </motion.div>
    </div>
  )
}
