/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // MedStock Design Tokens
        primary: {
          DEFAULT: '#1A73E8',
          dark: '#0D47A1',
          light: '#E3F2FD',
          hover: '#1565C0',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        text: {
          primary: '#1E293B',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        status: {
          ok: '#22C55E',
          'ok-bg': '#DCFCE7',
          'ok-text': '#166534',
          warning: '#F59E0B',
          'warning-bg': '#FEF9C3',
          'warning-text': '#854D0E',
          critical: '#EF4444',
          'critical-bg': '#FEE2E2',
          'critical-text': '#991B1B',
          info: '#3B82F6',
          'info-bg': '#DBEAFE',
          'info-text': '#1E40AF',
        },
        sidebar: {
          DEFAULT: '#0D47A1',
          hover: '#1565C0',
          active: '#1A73E8',
          text: '#FFFFFF',
          'text-muted': 'rgba(255,255,255,0.65)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': ['11px', '16px'],
        'sm': ['13px', '20px'],
        'base': ['14px', '22px'],
        'md': ['15px', '24px'],
        'lg': ['17px', '26px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '38px'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'dropdown': '0 8px 24px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
