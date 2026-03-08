import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard,
    Calendar,
    Library,
    Megaphone,
    CheckCircle,
    Briefcase,
    User,
    Settings,
    LogOut,
    Map,
    Zap,
    Target,
    PanelLeftOpen,
    PanelLeftClose,
    FileStack,
    History as LucideHistory,
    BookOpen,
    Upload,
    Scan,
    Users
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const STUDENT_NAV = [
    { to: '/', label: 'Home', icon: LayoutDashboard, desc: 'Dashboard' },
    { to: '/events', label: 'Events', icon: Calendar, desc: 'Campus events' },
    { to: '/materials', label: 'Materials', icon: Library, desc: 'Study files' },
    { to: '/study-rooms', label: 'Study Rooms', icon: Users, desc: 'Live collaboration' },
    { to: '/question-papers', label: 'Question Papers', icon: FileStack, desc: 'Previous papers' },
    { to: '/contribute', label: 'Contribute', icon: Upload, desc: 'Upload materials' },
    { to: '/announcements', label: 'Announcements', icon: Megaphone, desc: 'Campus notices' },
    { to: '/placements', label: 'Placements', icon: Briefcase, desc: 'Career drives' },
    { to: '/history', label: 'Event History', icon: LucideHistory, desc: 'My activity' },
];

const ADMIN_NAV = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview' },
    { to: '/admin/events', label: 'Events', icon: Calendar, desc: 'Manage events' },
    { to: '/admin/materials', label: 'Materials', icon: Library, desc: 'Manage files' },
    { to: '/admin/contributions', label: 'Moderate Notes', icon: CheckCircle, desc: 'Review student files' },
    { to: '/admin/question-papers', label: 'Question Papers', icon: FileStack, desc: 'Manage papers' },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone, desc: 'Post notices' },
    { to: '/admin/scanner', label: 'QR Scanner', icon: Scan, desc: 'Mark attendance' },
    { to: '/admin/registrations', label: 'Registrations', icon: CheckCircle, desc: 'Manage registrations' },
    { to: '/admin/placements', label: 'Placements', icon: Briefcase, desc: 'Manage drives' },
];

const Sidebar = () => {
    const [open, setOpen] = useState(false);       // mobile open
    const [collapsed, setCollapsed] = useState(false);     // desktop icon-only mode
    const [isDesktop, setDesktop] = useState(window.innerWidth >= 1024);
    const { user, logout } = useAuth();
    const { dark, toggle } = useTheme();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const h = (e) => { setDesktop(e.matches); if (e.matches) setOpen(false); };
        mq.addEventListener('change', h);
        return () => mq.removeEventListener('change', h);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => { setOpen(false); }, [location.pathname]);

    const handleLogout = () => { logout(); navigate('/login'); };

    const items = user?.role === 'admin' ? ADMIN_NAV : STUDENT_NAV;
    const section = user?.role === 'admin' ? 'Admin' : 'Student';
    const initials = (user?.name || user?.role || '?')[0].toUpperCase();
    const displayName = user?.name || (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User');

    const W = collapsed && isDesktop ? '68px' : '256px';

    const sidebarStyle = isDesktop
        ? { position: 'sticky', top: 0, height: '100vh', width: W, minWidth: W, flexShrink: 0, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', zIndex: 40, overflowY: 'auto', overflowX: 'hidden', transition: 'width 0.25s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column' }
        : { position: 'fixed', top: 0, left: 0, height: '100vh', width: '272px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', zIndex: 40, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)' };

    return (
        <>
            {/* ── Mobile hamburger ── */}
            {!isDesktop && !open && (
                <button onClick={() => setOpen(o => !o)}
                    style={{ position: 'fixed', top: '10px', left: '12px', zIndex: 50, width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#2563EB,#3B82F6)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(59,130,246,0.45)' }}>
                    ☰
                </button>
            )}

            {/* ── Mobile overlay ── */}
            {!isDesktop && open && (
                <div onClick={() => setOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(3px)' }} />
            )}

            {/* ── Sidebar ── */}
            <aside style={sidebarStyle}>

                {/* ═══ Brand header ═══ */}
                <div style={{ flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)', backdropFilter: 'blur(10px)' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: collapsed && isDesktop ? 'column' : 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: collapsed && isDesktop ? '20px 0' : '18px 16px',
                        gap: collapsed && isDesktop ? '14px' : '0',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        {/* Logo */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            overflow: 'hidden',
                            justifyContent: collapsed && isDesktop ? 'center' : 'flex-start',
                            flex: collapsed && isDesktop ? 'none' : 1,
                            width: collapsed && isDesktop ? '100%' : 'auto'
                        }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '22px',
                                flexShrink: 0,
                                boxShadow: '0 8px 20px -4px rgba(59,130,246,0.6), 0 0 15px rgba(59,130,246,0.2)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05) rotate(5deg)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
                            >
                                🎓
                            </div>
                            {(!collapsed || !isDesktop) && (
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <p style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '18px', margin: 0, letterSpacing: '-0.3px', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>CampusAI</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '10px', margin: 0, whiteSpace: 'nowrap', fontWeight: 600, letterSpacing: '0.05em' }}>PREMIUM ASSISTANT</p>
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle (Mobile only, top right) */}
                        {(!isDesktop && open) && (
                            <ThemeToggle />
                        )}


                        {/* Collapse toggle (desktop only) */}
                        {isDesktop && (
                            <button onClick={() => setCollapsed(c => !c)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-surface)',
                                    backdropFilter: 'blur(8px)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    padding: 0,
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                                }}
                                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.background = 'var(--bg-icon)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.background = 'var(--bg-surface)';
                                    e.currentTarget.style.transform = 'none';
                                }}>
                                {collapsed ? (
                                    <PanelLeftOpen size={20} strokeWidth={2.5} color="#60A5FA" />
                                ) : (
                                    <PanelLeftClose size={20} strokeWidth={2.5} color="#60A5FA" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* ═══ Navigation ═══ */}
                <nav style={{ flex: 1, padding: collapsed && isDesktop ? '16px 8px' : '16px 12px', overflowY: 'auto', overflowX: 'hidden', transition: 'padding 0.25s' }}>



                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {items.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/' || item.to === '/admin'}
                                title={collapsed && isDesktop ? item.label : undefined}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: collapsed && isDesktop ? '12px 0' : '11px 12px',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: isActive ? 700 : 500,
                                    textDecoration: 'none',
                                    transition: 'all 0.18s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    justifyContent: collapsed && isDesktop ? 'center' : 'flex-start',
                                    // Active state
                                    background: isActive ? 'var(--bg-icon)' : 'transparent',
                                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                                    borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                                    borderTopLeftRadius: '0px',
                                    borderBottomLeftRadius: '0px',
                                })}
                                onMouseEnter={e => {
                                    const isActive = e.currentTarget.classList.contains('active');
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                        e.currentTarget.style.borderLeftColor = 'var(--border-icon)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    const isActive = e.currentTarget.classList.contains('active');
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                        e.currentTarget.style.borderLeftColor = 'transparent';
                                    }
                                }}
                            >
                                {/* Icon Container to fix alignment */}
                                <div style={{
                                    width: '24px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.2))'
                                }}>
                                    <item.icon size={20} strokeWidth={2.2} />
                                </div>

                                {/* Label */}
                                {(!collapsed || !isDesktop) && (
                                    <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.01em' }}>
                                        {item.label}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* ═══ Bottom: logout only ═══ */}
                <div style={{ flexShrink: 0, borderTop: '1px solid var(--border)', padding: collapsed && isDesktop ? '14px 8px' : '14px 12px', transition: 'padding 0.25s', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {user && (
                        <button onClick={handleLogout}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '11px 12px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'transparent',
                                color: '#F87171',
                                fontSize: '15px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                justifyContent: collapsed && isDesktop ? 'center' : 'flex-start'
                            }}
                            title="Logout"
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                            <LogOut size={20} strokeWidth={2} />
                            {(!collapsed || !isDesktop) && <span>Logout</span>}
                        </button>
                    )}
                </div>

            </aside>
        </>
    );
};

export default Sidebar;
