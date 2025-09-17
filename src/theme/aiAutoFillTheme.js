// AI AutoFill Extension Theme - Dark professional theme with premium feel
export const aiAutoFillTheme = {
  colors: {
    // Primary colors - Professional blue palette
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    
    // Dark theme colors
    background: {
      primary: '#0f172a',    // Very dark blue-gray
      secondary: '#1e293b',  // Dark blue-gray
      tertiary: '#334155'    // Medium blue-gray
    },
    
    // Text colors for dark theme
    text: {
      primary: '#f8fafc',    // Almost white
      secondary: '#cbd5e1',  // Light gray
      muted: '#64748b'       // Medium gray
    },
    
    // Status colors
    success: '#10b981',      // Green
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
    
    // Accent colors
    accent: {
      purple: '#8b5cf6',
      cyan: '#06b6d4',
      emerald: '#10b981'
    }
  },
  
  // Component variants
  components: {
    Card: {
      variants: {
        default: 'bg-slate-800 border border-slate-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300',
        premium: 'bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300',
        glass: 'bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-lg hover:bg-slate-800/90 transition-all duration-300',
        interactive: 'bg-slate-800 border border-slate-700 rounded-lg shadow-lg hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 cursor-pointer',
        ai: 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg shadow-lg backdrop-blur-sm'
      }
    },
    
    Button: {
      variants: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 rounded-lg transition-all duration-200',
        ghost: 'hover:bg-slate-700 text-slate-300 rounded-lg transition-all duration-200',
        premium: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300',
        ai: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse'
      }
    },
    
    Badge: {
      variants: {
        success: 'bg-green-500/20 text-green-400 border border-green-500/30 rounded-full hover:bg-green-500/30 transition-colors duration-200',
        warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full hover:bg-amber-500/30 transition-colors duration-200',
        error: 'bg-red-500/20 text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/30 transition-colors duration-200',
        default: 'bg-slate-700 text-slate-300 border border-slate-600 rounded-full hover:bg-slate-600 transition-colors duration-200',
        ai: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 rounded-full animate-pulse'
      }
    }
  },

  // Animation presets
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin'
  },

  // Spacing system
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  }
};