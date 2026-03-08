import React from 'react';
import OrbitNeonLoader from './OrbitNeonLoader';

const PageLoader = () => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(2, 6, 23, 0.85)', // Matches website sidebar/header background
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
        }}>
            <OrbitNeonLoader />
        </div>
    );
};

export default PageLoader;
