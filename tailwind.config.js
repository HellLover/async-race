module.exports = {
  theme: {
    extend: {
      keyframes: {
        'car-move': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'car-move': 'car-move var(--animation-speed, 2s) linear forwards',
      },
    },
  },
}
