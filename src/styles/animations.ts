export const animationConfig = {
    keyframes: {
      'content-fade': {
        '0%': { opacity: '0', transform: 'translateY(15px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' }
      },
      'content-slide': {
        '0%': { transform: 'translateX(40px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' }
      },
      'toast-slide': {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' }
      }
    },
    animation: {
      'content-fade': 'content-fade 0.7s ease-out',
      'content-slide': 'content-slide 0.7s ease-out',
      'toast-slide': 'toast-slide 0.4s ease-out'
    }
  };