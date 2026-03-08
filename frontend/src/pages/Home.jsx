import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents } from '../services/eventService';
import { getMaterials } from '../services/materialService';
import { getAnnouncements } from '../services/announcementService';
import {
    Calendar,
    Library,
    Megaphone,
    LayoutDashboard,
    Bot,
    ArrowRight,
    Sparkles,
    Users,
    Activity,
    History,
    CheckCircle
} from 'lucide-react';

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
    <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flex: '1 1 200px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = `0 10px 25px -5px ${accent}20`;
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${accent}15`,
            border: `1px solid ${accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent
        }}>
            <Icon size={24} strokeWidth={2} />
        </div>
        <div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(24px, 5vw, 32px)', margin: 0, lineHeight: 1 }}>{value ?? '—'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 0', fontWeight: 600, letterSpacing: '0.01em' }}>{label}</p>
        </div>
        {sub && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={12} color={accent} />
                <p style={{ color: accent, fontSize: '11px', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>{sub}</p>
            </div>
        )}
    </div>
);

/* ── Quick action card ── */
const QuickCard = ({ to, icon: Icon, label, desc, accent }) => (
    <Link to={to} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        padding: '20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = accent;
            e.currentTarget.style.background = 'var(--bg-card-hover)';
            e.currentTarget.style.transform = 'translateX(6px)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.background = 'var(--bg-card)';
            e.currentTarget.style.transform = 'none';
        }}>
        <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: `${accent}15`,
            border: `1px solid ${accent}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            flexShrink: 0
        }}>
            <Icon size={22} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px', margin: 0 }}>{label}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <ArrowRight size={20} color={accent} style={{ flexShrink: 0 }} />
    </Link>
);

const Home = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [counts, setCounts] = useState({ events: 0, materials: 0, announcements: 0 });
    const [latest, setLatest] = useState([]);
    const [history, setHistory] = useState([]);
    const [loadingCounts, setLoadingCounts] = useState(true);

    useEffect(() => {
        Promise.all([getEvents(1, 100), getMaterials(1, 100), getAnnouncements(1, 100)])
            .then(([ev, mat, ann]) => {
                setCounts({
                    events: ev.total || 0,
                    materials: mat.total || 0,
                    announcements: ann.total || 0
                });
                setLatest((ann.items || []).slice(0, 3));
            })
            .catch(console.error)
            .finally(() => setLoadingCounts(false));

        if (!isAdmin && user) {
            const token = localStorage.getItem('token');
            fetch(`http://localhost:5000/api/history/my-history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setHistory(Array.isArray(data) ? data.slice(0, 3) : []))
                .catch(console.error);
        }
    }, [user, isAdmin]);

    const STUDENT_QUICKLINKS = [
        { to: '/events', icon: Calendar, label: 'Events', desc: 'Browse & register for campus events', accent: '#3B82F6' },
        { to: '/materials', icon: Library, label: 'Study Materials', desc: 'Download notes, slides & videos', accent: '#06B6D4' },
        { to: '/announcements', icon: Megaphone, label: 'Announcements', desc: 'Latest updates from campus', accent: '#F59E0B' },
    ];
    const ADMIN_QUICKLINKS = [
        { to: '/admin/events', icon: Calendar, label: 'Manage Events', desc: 'Add or delete events', accent: '#3B82F6' },
        { to: '/admin/materials', icon: Library, label: 'Manage Materials', desc: 'Upload study files', accent: '#06B6D4' },
        { to: '/admin/announcements', icon: Megaphone, label: 'Manage Announcements', desc: 'Post campus notices', accent: '#F59E0B' },
    ];
    const links = isAdmin ? ADMIN_QUICKLINKS : STUDENT_QUICKLINKS;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const displayName = user?.name || (isAdmin ? 'Admin' : 'Student');

    return (
        <div style={{ minHeight: '100%', padding: '28px 24px', background: 'var(--bg-main)', boxSizing: 'border-box' }}>

            {/* ── Welcome hero banner ── */}
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', padding: '28px 32px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
                        {isAdmin ? '🛠️ Admin Panel' : '🎓 Student Portal'}
                    </p>
                    <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(20px,3.5vw,32px)', margin: '0 0 8px', lineHeight: 1.25 }}>
                        {greeting}, {displayName} 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 20px', maxWidth: '500px', lineHeight: 1.6 }}>
                        {isAdmin
                            ? 'Manage campus events, materials and announcements from your admin panel.'
                            : 'Welcome back to CampusAI — your smart assistant for events, notes and campus updates.'}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(isAdmin
                            ? [{ label: 'Events', icon: Calendar }, { label: 'Materials', icon: Library }, { label: 'Notices', icon: Megaphone }]
                            : [{ label: 'AI Chat', icon: Bot }, { label: 'Events', icon: Calendar }, { label: 'Notes', icon: Library }, { label: 'Alerts', icon: Megaphone }]
                        ).map(f => (
                            <span key={f.label} style={{ background: 'var(--bg-icon)', border: '1px solid var(--border-icon)', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <f.icon size={13} strokeWidth={2.5} />
                                {f.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
                <StatCard icon={Calendar} label="Total Events" value={loadingCounts ? '…' : counts.events} accent="#3B82F6" sub="Campus events" />
                <StatCard icon={Library} label="Study Materials" value={loadingCounts ? '…' : counts.materials} accent="#06B6D4" sub="Files available" />
                <StatCard icon={Megaphone} label="Announcements" value={loadingCounts ? '…' : counts.announcements} accent="#F59E0B" sub="Posted notices" />
                {!isAdmin && <StatCard icon={Bot} label="AI Chatbot" value="24/7" accent="#22C55E" sub="Always online" />}
            </div>

            {/* ── Main Content Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px' }}>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Quick Access</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {links.map(c => <QuickCard key={c.to} {...c} />)}
                    </div>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Recent Notices</p>
                        <Link to="/announcements" style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {loadingCounts ? [1, 2, 3].map(i => <div key={i} style={{ height: '60px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }} />) :
                            latest.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No notices</p> :
                                latest.map(a => (
                                    <div key={a.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-icon)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}><Megaphone size={18} /></div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.content}</p>
                                        </div>
                                    </div>
                                ))}
                    </div>
                </div>

                {!isAdmin && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Event Activity</p>
                            <Link to="/history" style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {history.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No activity</p> :
                                history.map(h => (
                                    <div key={h.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-icon)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Calendar size={18} /></div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.event_title}</p>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>{h.timestamp?.split(' ')[0]}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 640px) {
                    div[style*="padding: 28px 24px"] { padding: 20px 16px !important; }
                    div[style*="padding: 28px 32px"] { padding: 20px 18px !important; }
                    div[style*="padding: 24px"] { padding: 16px !important; }
                    h1 { font-size: 24px !important; }
                    h2 { font-size: 18px !important; }
                }
            `}</style>
        </div>
    );
};

export default Home;
