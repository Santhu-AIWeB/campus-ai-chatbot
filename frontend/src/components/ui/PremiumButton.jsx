import React from 'react';

const LoadingSpinner = ({ size = 20, color = "#3B82F6" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ overflow: 'visible' }}
    >
        <style>
            {`
        @keyframes comet-arc-mini {
          0% { stroke-dashoffset: 280; transform: rotate(0deg); }
          50% { stroke-dashoffset: 70; transform: rotate(180deg); }
          100% { stroke-dashoffset: 280; transform: rotate(360deg); }
        }
      `}
        </style>
        <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="280"
            strokeDashoffset="280"
            style={{
                animation: 'comet-arc-mini 1.2s ease-in-out infinite',
                transformOrigin: '50px 50px',
                filter: `drop-shadow(0 0 5px ${color})`
            }}
        />
    </svg>
);

const PremiumButton = ({
    children,
    loading = false,
    disabled = false,
    type = "button",
    onClick,
    className = "btn-primary",
    style = {}
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={className}
            style={{
                ...style,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {loading && <LoadingSpinner size={18} color="#fff" />}
            <span style={{ opacity: loading ? 0.7 : 1 }}>
                {children}
            </span>

            {/* Subtle Glow Effect on Hover */}
            <style>{`
        .btn-primary:not(:disabled):hover {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
          transform: translateY(-1px);
        }
        .btn-primary:active {
          transform: translateY(0);
        }
      `}</style>
        </button>
    );
};

export default PremiumButton;
