/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Modern gradient palette - Soft & Inviting
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        accent: {
          coral: '#FF6B6B',
          peach: '#FFB88C',
          lavender: '#C8B6FF',
          mint: '#6BCF7F',
          sky: '#4ECDC4',
          sunset: '#FF6F91',
        },
        // Warm & Cool neutrals
        warm: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
        },
        cool: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
        },
      },
      backgroundImage: {
        // Dreamy gradients
        'gradient-sunset': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
        'gradient-peach': 'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)',
        'gradient-mint': 'linear-gradient(135deg, #FCCF31 0%, #F55555 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)',
        'gradient-rose': 'linear-gradient(135deg, #FFA8A8 0%, #FCFF00 100%)',
        'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-cool': 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
        
        // Smooth transitions
        'gradient-smooth-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #F093FB 100%)',
        'gradient-smooth-2': 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
        'gradient-smooth-3': 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
        'gradient-smooth-4': 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
        'gradient-smooth-5': 'linear-gradient(135deg, #30CFD0 0%, #330867 100%)',
        
        // Soft pastels
        'gradient-pastel-1': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'gradient-pastel-2': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'gradient-pastel-3': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'gradient-pastel-4': 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        
        // Deep & Rich
        'gradient-deep-1': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        'gradient-deep-2': 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
        
        // Light mode friendly
        'gradient-light-1': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        'gradient-light-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-light-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(102, 126, 234, 0.5)',
        'glow-md': '0 0 30px rgba(102, 126, 234, 0.4)',
        'glow-lg': '0 0 50px rgba(102, 126, 234, 0.3)',
        'glow-coral': '0 0 30px rgba(255, 107, 107, 0.5)',
        'glow-mint': '0 0 30px rgba(107, 207, 127, 0.5)',
        'glow-purple': '0 0 30px rgba(200, 182, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
