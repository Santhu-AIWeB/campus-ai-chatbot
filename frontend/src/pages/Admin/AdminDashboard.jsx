import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../services/api';
import { getEvents } from '../../services/eventService';
import { getMaterials } from '../../services/materialService';
import { getAnnouncements } from '../../services/announcementService';
import { getRegistrations } from '../../services/registrationService';
import {
    Calendar,
    Library,
    Megaphone,
    CheckCircle,
    Briefcase,
    ArrowRight,
    LayoutDashboard,
    Clock,
    Activity,
    Users
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
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '6px 0 0', fontWeight: 600, letterSpacing: '0.01em' }}>{label}</p>
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
            e.currentTarget.style.background = '#1E293B';
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

const AdminDashboard = () => {
    const { user } = useAuth();
    const [counts, setCounts] = useState({ events: 0, materials: 0, announcements: 0, registrations: 0, placements: 0 });
    const [latest, setLatest] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${BASE_URL}/events?limit=100`).then(r => r.json()),
            fetch(`${BASE_URL}/materials?limit=100`).then(r => r.json()),
            fetch(`${BASE_URL}/announcements?limit=100`).then(r => r.json()),
            fetch(`${BASE_URL}/registrations`).then(r => r.json()),
            fetch(`${BASE_URL}/placements?limit=100`).then(r => r.json())
        ])
            .then(([ev, mat, ann, reg, plc]) => {
                setCounts({
                    events: ev.total || 0,
                    materials: mat.total || 0,
                    announcements: ann.total || 0,
                    registrations: reg.length || 0, // Registrations might not be paginated yet
                    placements: plc.total || 0
                });
                setLatest((ev.items || []).slice(0, 3));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const displayName = user?.name || 'Admin';

    const ADMIN_QUICKLINKS = [
        { to: '/admin/events', icon: Calendar, label: 'Manage Events', desc: 'Add or delete campus events', accent: '#3B82F6' },
        { to: '/admin/materials', icon: Library, label: 'Manage Materials', desc: 'Upload study files & notes', accent: '#06B6D4' },
        { to: '/admin/announcements', icon: Megaphone, label: 'Manage Announcements', desc: 'Post important campus notices', accent: '#F59E0B' },
        { to: '/admin/registrations', icon: CheckCircle, label: 'Manage Registrations', desc: 'Track student event signups', accent: '#10B981' },
        { to: '/admin/placements', icon: Briefcase, label: 'Manage Placements', desc: 'Post and track job opportunities', accent: '#A855F7' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)', boxSizing: 'border-box' }}>

            {/* ── Welcome hero banner ── */}
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', padding: '24px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)' }} className="sm:p-8">
                {/* Glow orb */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ color: '#3B82F6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LayoutDashboard size={14} /> ADMIN PANEL
                    </p>
                    <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(20px,3.5vw,32px)', margin: '0 0 8px', lineHeight: 1.25 }}>
                        {greeting}, {displayName} 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 20px', maxWidth: '520px', lineHeight: 1.6 }}>
                        Manage campus events, materials and announcements from your admin panel. Control center is live.
                    </p>

                    {/* Feature pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {[
                            { label: 'Events', icon: Calendar },
                            { label: 'Placements', icon: Briefcase },
                            { label: 'Notices', icon: Megaphone }
                        ].map(f => (
                            <span key={f.label} style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93C5FD', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <f.icon size={13} strokeWidth={2.5} />
                                {f.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
                <StatCard icon={Calendar} label="Total Events" value={loading ? '…' : counts.events} accent="#3B82F6" sub="CAMPUS EVENTS" />
                <StatCard icon={Library} label="Study Materials" value={loading ? '…' : counts.materials} accent="#06B6D4" sub="FILES AVAILABLE" />
                <StatCard icon={Megaphone} label="Announcements" value={loading ? '…' : counts.announcements} accent="#F59E0B" sub="POSTED NOTICES" />
                <StatCard icon={CheckCircle} label="Registrations" value={loading ? '…' : counts.registrations} accent="#10B981" sub="GLOBAL SIGNUPS" />
                <StatCard icon={Briefcase} label="Placements" value={loading ? '…' : counts.placements} accent="#A855F7" sub="CAREER DRIVES" />
            </div>

            {/* ── Two-column: Quick access + Recent activity ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>

                {/* Quick access */}
                <div>
                    <p style={{ color: '#64748B', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Quick Access</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ADMIN_QUICKLINKS.map(c => <QuickCard key={c.to} {...c} />)}
                    </div>
                </div>

                {/* Recent notices/activity */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Recent Activity</p>
                        <Link to="/admin/events" style={{ color: '#3B82F6', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1F2937', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: '12px', borderRadius: '4px', background: '#1F2937', marginBottom: '6px', width: '70%' }} />
                                        <div style={{ height: '10px', borderRadius: '4px', background: '#1F2937', width: '40%' }} />
                                    </div>
                                </div>
                            ))
                        ) : latest.length === 0 ? (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
                                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>No recent activity</p>
                            </div>
                        ) : (
                            latest.map((ev, i) => (
                                <div key={ev._id || ev.id || i}
                                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', gap: '12px', transition: 'border-color 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-icon)', border: '1px solid var(--border-icon)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
                                        <Calendar size={18} strokeWidth={2.5} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {ev.title}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={11} /> {ev.date || 'Update logged'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
