export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        arcade: {
          dark: '#0a0e27',
          neon: '#00ff41',
          cyan: '#00ffff',
          pink: '#ff006e'
        }
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 255, 65, 0.6)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.6)',
        'glow-pink': '0 0 20px rgba(255, 0, 110, 0.6)'
      },
      fontFamily: {
        arcade: ['Press Start 2P', 'cursive']
      }
    }
  },
  plugins: []
}
