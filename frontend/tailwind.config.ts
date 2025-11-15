import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'digital-black': '#0A0A0A',
        'digital-white': '#F0F0F0',
        'kintsugi-gold': '#F0FF00',
        'cyber-pink': '#FF00FF',
        'cyber-cyan': '#00FFFF',
        'neon-orange': '#FF6B00',
        'electric-purple': '#9D00FF',
        'matrix-green': '#00FF41',
      },
      fontFamily: {
        'mono': ['"Courier New"', 'Courier', 'monospace'],
      },
      boxShadow: {
        'neo': '8px 8px 0px 0px rgba(240, 255, 0, 1)',
        'neo-white': '8px 8px 0px 0px rgba(240, 240, 240, 1)',
        'neo-cyan': '8px 8px 0px 0px rgba(0, 255, 255, 1)',
        'neo-pink': '8px 8px 0px 0px rgba(255, 0, 255, 1)',
        'neo-orange': '8px 8px 0px 0px rgba(255, 107, 0, 1)',
        'neo-purple': '8px 8px 0px 0px rgba(157, 0, 255, 1)',
      },
      borderWidth: {
        '3': '3px',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'glitch': 'glitch 1s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'blink': 'blink 1.5s step-end infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
