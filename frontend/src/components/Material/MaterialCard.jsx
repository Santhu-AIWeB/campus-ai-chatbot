import React from 'react';
import { FileText, BarChart, Video, FilePen, Folder, Eye, Download, ShieldCheck } from 'lucide-react';
import { ROOT_URL } from '../../services/api';

const TYPE_META = {
    PDF: { icon: FileText, accent: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
    PPT: { icon: BarChart, accent: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
    Video: { icon: Video, accent: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
    Notes: { icon: FilePen, accent: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
    'Question Paper': { icon: FileText, accent: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
};
const DEF = { icon: Folder, accent: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };

const MaterialCard = ({ material }) => {
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const meta = TYPE_META[material.type] || DEF;
    const Icon = meta.icon;
    const rawLink = material.file_url || material.fileUrl;
    const fileLink = (rawLink && rawLink.startsWith('/api')) ? `${ROOT_URL}${rawLink}` : rawLink;

    const handleDownload = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!fileLink) return;

        const link = document.createElement('a');
        link.href = fileLink;
        link.setAttribute('download', material.title || 'download');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (fileLink) window.open(fileLink, '_blank');
    };

    return (
        <div
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: isMobile ? '1.5rem' : '2.25rem',
                padding: isMobile ? '20px' : '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '18px' : '24px',
                transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isMobile ? '0 10px 30px -15px rgba(0, 0, 0, 0.3)' : '0 20px 50px -20px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                e.currentTarget.style.borderColor = meta.accent + '40';
                e.currentTarget.style.boxShadow = `0 30px 60px -12px rgba(0, 0, 0, 0.5), 0 0 20px ${meta.accent}15`;
                e.currentTarget.querySelector('.card-glow').style.opacity = '1';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = '0 10px 40px -15px rgba(0, 0, 0, 0.4)';
                e.currentTarget.querySelector('.card-glow').style.opacity = '0';
            }}
        >
            {/* Glossy Overlay */}
            <div className="card-glow" style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${meta.accent}15 0%, transparent 70%)`, pointerEvents: 'none', opacity: 0, transition: 'opacity 0.5s ease' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: `radial-gradient(circle at top right, ${meta.accent}10 0%, transparent 70%)`, pointerEvents: 'none' }} />

            {/* Top Row: Icon & Badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 1 }}>
                <div style={{
                    width: isMobile ? '52px' : '64px',
                    height: isMobile ? '52px' : '64px',
                    borderRadius: isMobile ? '16px' : '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${meta.bg}, transparent)`,
                    border: `1px solid ${meta.border}`,
                    color: meta.accent,
                    boxShadow: `0 8px 20px -8px ${meta.accent}40`,
                    position: 'relative'
                }}>
                    <div style={{ position: 'absolute', inset: '-2px', borderRadius: 'inherit', padding: '2px', background: `linear-gradient(135deg, ${meta.accent}40, transparent)`, WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none' }} />
                    <Icon size={isMobile ? 26 : 32} strokeWidth={2.5} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    {material.type && (
                        <div style={{
                            fontSize: '9px',
                            fontWeight: 900,
                            padding: '6px 14px',
                            borderRadius: '99px',
                            background: `${meta.accent}15`,
                            color: meta.accent,
                            border: `1px solid ${meta.accent}30`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: meta.accent, boxShadow: `0 0 8px ${meta.accent}` }} />
                            {material.type}
                        </div>
                    )}
                    {material.semester && (
                        <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={12} /> Sem {material.semester.replace('Semester', '').trim()}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div style={{ flex: 1, zIndex: 1 }}>
                <h3 style={{
                    color: 'var(--text-primary)',
                    fontWeight: 900,
                    fontSize: isMobile ? '18px' : '22px',
                    margin: '0 0 10px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.25,
                    letterSpacing: '-0.03em',
                    minHeight: isMobile ? '2.5em' : '2.6em'
                }}>
                    {material.title}
                </h3>
                {material.subject && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                        <div style={{ p: '5px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            <Folder size={12} color={meta.accent} />
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{material.subject}</p>
                    </div>
                )}
            </div>

            {/* Actions Section */}
            <div style={{ display: 'flex', gap: isMobile ? '10px' : '15px', marginTop: '4px', zIndex: 1 }}>
                <button
                    onClick={handleView}
                    disabled={!fileLink}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: isMobile ? '12px' : '16px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: fileLink ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                    }}
                    onMouseEnter={e => { if (fileLink) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = meta.accent + '40'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                >
                    <Eye size={isMobile ? 16 : 20} /> View
                </button>

                <button
                    onClick={handleDownload}
                    disabled={!fileLink}
                    style={{
                        flex: 1.4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: isMobile ? '12px' : '16px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`,
                        border: 'none',
                        color: '#000',
                        fontSize: '13px',
                        fontWeight: 900,
                        cursor: fileLink ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                        opacity: fileLink ? 1 : 0.5,
                        boxShadow: `0 10px 25px -10px ${meta.accent}60`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={e => { if (fileLink) { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 15px 30px -10px ${meta.accent}80`; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 10px 25px -10px ${meta.accent}60`; }}
                >
                    <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 2s infinite' }} />
                    <Download size={isMobile ? 16 : 20} strokeWidth={2.5} /> Download
                </button>
            </div>

            {/* Animated Bottom Indicator */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '5px',
                background: `linear-gradient(90deg, transparent, ${meta.accent}40, transparent)`,
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: '40%',
                    background: `linear-gradient(90deg, transparent, ${meta.accent}, transparent)`,
                    animation: 'slideInfinite 2.5s infinite linear'
                }} />
            </div>

            <style>{`
                @keyframes shimmer {
                    from { left: -100%; }
                    to { left: 100%; }
                }
                @keyframes slideInfinite {
                    from { transform: translateX(-150%); }
                    to { transform: translateX(250%); }
                }
            `}</style>
        </div>
    );
};

export default MaterialCard;
