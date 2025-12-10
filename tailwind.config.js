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
        // Modern gradient palette - Fresh & Vibrant
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        accent: {
          cyan: '#06b6d4',
          orange: '#f97316',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
          teal: '#14b8a6',
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
        // Modern gradients
        'gradient-sunset': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        'gradient-tropical': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-fire': 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #06b6d4 0%, #f97316 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        'gradient-cool': 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        
        // Smooth transitions
        'gradient-smooth-1': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
        'gradient-smooth-2': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-smooth-3': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        'gradient-smooth-4': 'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)',
        'gradient-smooth-5': 'linear-gradient(135deg, #06b6d4 0%, #164e63 100%)',
        
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
