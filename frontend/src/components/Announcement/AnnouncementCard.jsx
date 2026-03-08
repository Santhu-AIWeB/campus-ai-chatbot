import React, { useState } from 'react';

const AnnouncementCard = ({ announcement }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = (announcement.content?.length || 0) > 160;

    const CS = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div style={CS}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border)';
            }}>

            {/* Accent top bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #F59E0B, #FB923C)'
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '4px' }}>
                {/* Icon */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    borderRadius: '8px',
                    background: 'var(--bg-icon)',
                    border: '1px solid var(--border-icon)'
                }}>
                    📢
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: '16px',
                        margin: 0,
                        lineHeight: 1.4
                    }}>
                        {announcement.title}
                    </h3>
                    {announcement.date && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0' }}>🗓 {announcement.date}</p>
                    )}
                </div>
            </div>

            {announcement.content && (
                <div style={{ marginTop: '12px' }}>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '13.5px',
                        lineHeight: '1.6',
                        margin: 0,
                        ...((!expanded && isLong) ? { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' } : {})
                    }}>
                        {announcement.content}
                    </p>
                    {isLong && (
                        <button
                            onClick={() => setExpanded(e => !e)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#F59E0B',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '6px 0 0',
                                transition: 'color 0.15s'
                            }}
                        >
                            {expanded ? '▲ Show less' : '▼ Read more'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnnouncementCard;
