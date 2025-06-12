/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Primary Color (Snake, Success)
        'snake-green': '#4CAF50',
        'success-green': '#8BC34A',
        // Secondary Color (Dark Background)
        'brand-dark-bg': '#263238',
        // Accent Color (CTA, Highlights, #1 Scoreboard)
        'brand-accent': '#FF9800',
        // Neutral Palette
        'brand-light-gray': '#ECEFF1',   // Text on dark
        'brand-medium-gray': '#B0BEC5', // Borders, #2 Scoreboard
        'brand-off-white': '#FAFAFA',    // Alt text
        'brand-darker-gray': '#37474F', // Game board bg, scoreboard row
        'brand-even-darker-gray': '#2E3C43', // Alt scoreboard row, modal bg
        // Medal Colors (as per plan, accent is #1)
        'medal-gold': '#FF9800', // Rank 1
        'medal-silver': '#B0BEC5', // Rank 2
        'medal-bronze': '#795548', // Rank 3 (approximating, using provided hex)
        // State Colors
        'brand-warning': '#FFC107', // Amber
        'brand-error': '#F44336',   // Red (Game Over text)
        // Additional colors from HTML preview for UI elements
        'button-secondary-bg': '#546E7A',
        'button-secondary-hover': '#455A64',
        'button-success-bg': '#66BB6A',
        'button-success-hover': '#4CAF50',
        'button-warning-bg': '#FFA726',
        'button-warning-hover': '#FF9800',
        'input-field-bg': '#37474F',
        'input-field-border': '#546E7A',
        'input-field-focus-border': '#FF9800',
        'title-gradient-from': '#4CAF50',
        'title-gradient-to': '#8BC34A',
        'title-gradient-scoreboard-from': '#FF9800',
        'title-gradient-scoreboard-to': '#FFC107',
        'score-text-color': '#FF9800', // Same as brand-accent
        'game-board-border': '#455A64',
      },
      boxShadow: {
        'retro-md': '0 15px 30px rgba(0,0,0,0.4), inset 0 0 10px rgba(0,0,0,0.2)',
        'retro-lg': '0 20px 40px rgba(0,0,0,0.6)',
        'btn-hover': '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)',
      },
      animation: {
        pulseFood: 'pulseFood 1.2s infinite ease-in-out',
      },
      keyframes: {
        pulseFood: {
          '0%, 100%': { transform: 'scale(0.85)', opacity: '0.8' },
          '50%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
