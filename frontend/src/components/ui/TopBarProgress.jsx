import React from 'react';

const TopBarProgress = ({ loading }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            zIndex: 10000,
            pointerEvents: 'none',
            overflow: 'hidden',
            opacity: loading ? 1 : 0,
            transition: 'opacity 0.4s ease'
        }}>
            <style>
                {`
          @keyframes progress-zip {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
            </style>
            <div style={{
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, #3B82F6, #60A5FA, #3B82F6, transparent)',
                boxShadow: '0 0 10px rgba(59, 130, 246, 1)',
                animation: loading ? 'progress-zip 1.5s infinite linear' : 'none'
            }} />
        </div>
    );
};

export default TopBarProgress;
