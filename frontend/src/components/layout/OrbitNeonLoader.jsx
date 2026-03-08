import React from 'react';

const OrbitNeonLoader = () => {
    return (
        <div style={{
            position: 'relative',
            width: 'clamp(80px, 15vw, 120px)',
            height: 'clamp(80px, 15vw, 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px'
        }}>
            <style>
                {`
                @keyframes orbit-rotate {
                    0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                    100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
                }
                @keyframes glow-pulse-blue {
                    0%, 100% { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5)); opacity: 0.7; }
                    50% { filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.9)); opacity: 1; }
                }
                .orbit-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 2px solid transparent;
                    border-radius: 50%;
                    border-top: 2px solid #3B82F6;
                    border-left: 2px solid #60A5FA;
                }
                `}
            </style>

            {/* Orbiting Ring 1 */}
            <div className="orbit-ring" style={{
                animation: 'orbit-rotate 2s linear infinite, glow-pulse-blue 1.5s infinite ease-in-out',
                transform: 'rotateX(35deg) rotateY(-45deg)'
            }} />

            {/* Orbiting Ring 2 */}
            <div className="orbit-ring" style={{
                animation: 'orbit-rotate 2.5s linear infinite reverse, glow-pulse-blue 1.8s infinite ease-in-out',
                transform: 'rotateX(-35deg) rotateY(45deg)',
                borderTopColor: '#60A5FA',
                borderLeftColor: '#3B82F6'
            }} />

            {/* Orbiting Ring 3 */}
            <div className="orbit-ring" style={{
                animation: 'orbit-rotate 3s linear infinite',
                transform: 'rotateX(70deg) rotateY(20deg)',
                borderTopColor: '#2563EB',
                opacity: 0.6
            }} />

            {/* Center Glowing Core */}
            <div style={{
                width: 'clamp(8px, 2vw, 12px)',
                height: 'clamp(8px, 2vw, 12px)',
                background: '#3B82F6',
                borderRadius: '50%',
                boxShadow: '0 0 20px #3B82F6, 0 0 40px rgba(59, 130, 246, 0.5)',
                zIndex: 10
            }} />
        </div>
    );
};

export default OrbitNeonLoader;
