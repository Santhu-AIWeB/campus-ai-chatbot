import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWidget from '../Chat/ChatWidget';
import PageLoader from './PageLoader';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    User as UserIcon,
    LogOut,
    GraduationCap,
    Building,
    Fingerprint,
    ChevronRight,
    Circle
} from 'lucide-react';
import TopBarProgress from '../ui/TopBarProgress';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from '../ui/ThemeToggle';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropOpen, setDropOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [loading, setLoading] = useState(false);
    const dropRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show loader on route change
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800); // Show for 800ms
        return () => clearTimeout(timer);
    }, [location.pathname]);

    const initials = (user?.name || user?.role || '?')[0].toUpperCase();
    const displayName = user?.name || (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User');

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', position: 'relative' }}>
            <TopBarProgress loading={loading} />
            {loading && <PageLoader />}
            <Sidebar />

            <style>{`
                @keyframes content-entrance {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .page-content-enter {
                    animation: content-entrance 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>

            {/* ── Right column (navbar + page content) ── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

                {/* ─── Top Navbar ─── */}
                <header style={{
                    flexShrink: 0,
                    height: '60px',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    padding: isMobile ? '0 16px' : '0 24px',
                    gap: '12px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 20
                }}>

                    <div style={{ flex: 1 }} />

                    {!isMobile && <ThemeToggle />}
                    <NotificationCenter />



                    {/* Avatar + dropdown */}
                    <div ref={dropRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setDropOpen(o => !o)}
                            title={displayName}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: dropOpen ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = dropOpen ? 'none' : 'none';
                                e.currentTarget.style.boxShadow = dropOpen ? '0 0 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.3)';
                            }}>
                            {initials}
                        </button>

                        {/* Dropdown panel */}
                        {dropOpen && (
                            <div style={{
                                position: isMobile ? 'fixed' : 'absolute',
                                top: isMobile ? '70px' : '54px',
                                right: isMobile ? '16px' : 0,
                                left: isMobile ? '16px' : 'auto',
                                width: isMobile ? 'auto' : '320px',
                                maxWidth: isMobile ? 'calc(100vw - 32px)' : '320px',
                                background: 'var(--bg-overlay)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid var(--border)',
                                borderRadius: '20px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 30px rgba(59, 130, 246, 0.1)',
                                overflow: 'hidden',
                                zIndex: 99,
                                padding: isMobile ? '24px' : '28px'
                            }}>
                                {/* User Info (Centered) */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
                                    {/* Large Avatar with Glow and Ring */}
                                    <div style={{
                                        width: '88px',
                                        height: '88px',
                                        borderRadius: '28px',
                                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '36px',
                                        color: '#FFFFFF',
                                        fontWeight: 800,
                                        marginBottom: '18px',
                                        boxShadow: '0 0 0 4px var(--bg-icon), 0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                                        border: '2px solid var(--border-icon)',
                                        position: 'relative',
                                        transform: 'rotate(-2deg)'
                                    }}>
                                        <div style={{ transform: 'rotate(2deg)' }}>{initials}</div>
                                        {/* Pulse Status Indicator */}
                                        <div className="pulse-status" style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            right: '-2px',
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '50%',
                                            background: '#10B981',
                                            border: '3px solid var(--bg-card)',
                                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
                                        }} />
                                    </div>

                                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '22px', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                                        {displayName}
                                    </h3>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '13px', fontWeight: 700, margin: '0 0 16px', background: 'var(--bg-icon)', padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--border-icon)' }}>
                                        <Fingerprint size={14} />
                                        <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                                            {user?.role === 'student' ? '23951A66H3' : 'ADMIN-ID-1001'}
                                        </span>
                                    </div>

                                    {/* Interactive Info Rows */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                        {[
                                            { icon: GraduationCap, text: user?.role === 'student' ? 'B.Tech VI Sem - D Section' : 'System Administrator' },
                                            { icon: Building, text: user?.role === 'student' ? 'Computer Science (AI&ML)' : 'Campus-AI Governance' }
                                        ].map((row, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '13.5px',
                                                    fontWeight: 600,
                                                    background: 'var(--bg-surface)',
                                                    padding: '12px 16px',
                                                    borderRadius: '14px',
                                                    border: '1px solid var(--border)',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'default'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.background = 'var(--bg-icon)';
                                                    e.currentTarget.style.borderColor = 'var(--border-icon)';
                                                    e.currentTarget.style.color = 'var(--text-primary)';
                                                    e.currentTarget.style.transform = 'translateX(4px)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.borderColor = 'transparent';
                                                    e.currentTarget.style.color = 'var(--text-muted)';
                                                    e.currentTarget.style.transform = 'none';
                                                }}
                                            >
                                                <row.icon size={16} strokeWidth={2.2} style={{ color: '#3B82F6' }} />
                                                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.text}</span>
                                                <ChevronRight size={14} style={{ opacity: 0.3 }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                    <button
                                        onClick={() => { setDropOpen(false); navigate('/profile'); }}
                                        className="shimmer-bg"
                                        style={{
                                            flex: 1.4,
                                            padding: '14px',
                                            borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                                            color: '#FFFFFF',
                                            border: 'none',
                                            fontWeight: 800,
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                            e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(37, 99, 235, 0.6)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(37, 99, 235, 0.4)';
                                        }}
                                    >
                                        <UserIcon size={18} strokeWidth={2.5} />
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '14px',
                                            background: 'rgba(239, 68, 68, 0.08)',
                                            color: '#EF4444',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            fontWeight: 800,
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                                            e.currentTarget.style.transform = 'none';
                                        }}
                                    >
                                        <LogOut size={18} strokeWidth={2.5} />
                                        Exit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* ─── Page content ─── */}
                <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }} className={!loading ? 'page-content-enter' : ''}>
                    {children}
                </main>
            </div>

            <ChatWidget />
        </div>
    );
};

export default Layout;
