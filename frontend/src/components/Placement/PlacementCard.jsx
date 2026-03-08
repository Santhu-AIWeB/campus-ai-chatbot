import React from 'react';

const BANNER_COLORS = [
    { from: '#1E293B', to: '#0F172A' },
    { from: '#111827', to: '#0B1120' },
    { from: '#020617', to: '#0F172A' },
    { from: '#0F172A', to: '#1E293B' },
];

const PlacementCard = ({ placement, onApply, isApplied, applicationStatus, studentSemester }) => {
    const [applying, setApplying] = React.useState(false);
    const g = BANNER_COLORS[(placement.company?.charCodeAt(0) || 0) % BANNER_COLORS.length];

    const isEligible = placement.semester === 'All' || placement.semester === studentSemester;

    const statusColors = {
        'Applied': { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' },
        'Shortlisted': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
        'Rejected': { bg: 'rgba(239, 68, 68, 0.15)', text: '#FCA5A5', border: 'rgba(239, 68, 68, 0.3)' },
        'Hired': { bg: 'rgba(139, 92, 246, 0.2)', text: '#A78BFA', border: 'rgba(139, 92, 246, 0.4)' }
    };

    const statusStyle = statusColors[applicationStatus] || statusColors['Applied'];

    const CS = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        height: '100%',
        minHeight: '340px',
        position: 'relative',
        opacity: isEligible ? 1 : 0.85
    };

    return (
        <div style={CS}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = isEligible ? 'var(--accent)' : 'var(--border)';
                e.currentTarget.style.transform = isEligible ? 'translateY(-8px)' : 'none';
                e.currentTarget.style.boxShadow = isEligible ? '0 20px 40px rgba(0,0,0,0.5)' : 'none';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
            }}>

            {/* Banner Section */}
            <div style={{
                position: 'relative', width: '100%', height: '100px',
                background: `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
                    background: 'rgba(59,130,246,0.15)', filter: 'blur(20px)'
                }} />
                <span style={{ fontSize: '44px', opacity: 0.3, userSelect: 'none' }}>💼</span>

                {/* Eligibility/Status Badge */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                    {(!placement.job_link && isApplied) && (
                        <span style={{
                            padding: '4px 12px', borderRadius: '20px', background: statusStyle.bg,
                            color: statusStyle.text, border: `1px solid ${statusStyle.border}`,
                            fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                            backdropFilter: 'blur(4px)', zIndex: 10
                        }}>
                            {applicationStatus || 'Applied'}
                        </span>
                    )}
                    {(!isEligible && !isApplied) && (
                        <span style={{
                            padding: '4px 12px', borderRadius: '20px', background: 'rgba(239, 68, 68, 0.15)',
                            color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.3)',
                            fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                            backdropFilter: 'blur(4px)', zIndex: 10
                        }}>
                            Ineligible
                        </span>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{
                        color: 'var(--text-primary)', fontWeight: 800, fontSize: '16px', margin: 0,
                        textTransform: 'uppercase', letterSpacing: '-0.2px'
                    }}>
                        {placement.company}
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                        <span style={{ fontSize: '14px' }}>💼</span>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{placement.role}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <span style={{ fontSize: '14px' }}>💰</span>
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{placement.package || 'Competitive'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: '14px' }}>📍</span>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{placement.location || 'Remote'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isEligible ? '#64748B' : '#EF4444' }}>
                        <span style={{ fontSize: '14px' }}>🎓</span>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>Allowed: {placement.semester || 'All'}</span>
                    </div>

                    {placement.deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F87171', marginTop: '4px' }}>
                            <span style={{ fontSize: '14px' }}>⏳</span>
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>Ends: {placement.deadline}</span>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }} />

                <button
                    onClick={async () => {
                        if (!isEligible) return;
                        if (placement.job_link) {
                            window.open(placement.job_link, '_blank');
                        } else if (!isApplied && !applying) {
                            setApplying(true);
                            await onApply(placement.id);
                            setApplying(false);
                        }
                    }}
                    disabled={(!placement.job_link && isApplied) || applying || !isEligible}
                    style={{
                        width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                        background: !isEligible ? 'rgba(255, 255, 255, 0.05)' : ((!placement.job_link && isApplied) ? 'rgba(34, 197, 94, 0.15)' : (applying ? 'rgba(59, 130, 246, 0.2)' : 'linear-gradient(135deg, #3B82F6, #2563EB)')),
                        color: !isEligible ? '#475569' : ((!placement.job_link && isApplied) ? '#4ADE80' : '#FFFFFF'),
                        fontSize: '13px', fontWeight: 700,
                        cursor: ((!placement.job_link && isApplied) || applying || !isEligible) ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: ((!placement.job_link && isApplied) || applying || !isEligible) ? 'none' : '0 8px 16px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    {!isEligible ? 'Not Eligible' :
                        ((!placement.job_link && isApplied) ? '✅ Applied' :
                            (applying ? '⏳ Applying...' :
                                (placement.job_link ? 'Apply on External Portal ↗' : 'Apply Now →')))}
                </button>
            </div>
        </div>
    );
};

export default PlacementCard;
