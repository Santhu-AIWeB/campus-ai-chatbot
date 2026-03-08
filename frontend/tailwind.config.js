/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // ── Navy backgrounds ──
                navy: {
                    950: '#020617',   // Sidebar
                    900: '#0F172A',   // Main bg
                    800: '#111827',   // Secondary bg
                    700: '#1E293B',   // Bot bubble / slightly lighter
                    600: '#1F2937',   // Card bg
                },
                // ── Blue accent ──
                brand: {
                    DEFAULT: '#3B82F6',   // Primary
                    hover: '#60A5FA',   // Hover
                    active: '#2563EB',   // Active/deep
                    muted: '#1D4ED8',   // Badge bg
                    subtle: 'rgba(59,130,246,0.12)', // Tinted bg
                },
                // ── Borders ──
                border: {
                    DEFAULT: '#374151',
                    subtle: '#1F2937',
                },
                // ── Text ──
                ink: {
                    primary: '#F9FAFB',
                    secondary: '#D1D5DB',
                    muted: '#9CA3AF',
                    dim: '#6B7280',
                },
                // ── Status ──
                status: {
                    success: '#22C55E',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#06B6D4',
                },
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui'],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                'pulse-glow': {
                    '0%,100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
                    '50%': { boxShadow: '0 0 16px 4px rgba(59,130,246,0.35)' },
                },
            },
            boxShadow: {
                'blue-md': '0 4px 24px rgba(59,130,246,0.18)',
                'blue-lg': '0 8px 40px rgba(59,130,246,0.25)',
            },
        },
    },
    plugins: [],
}
