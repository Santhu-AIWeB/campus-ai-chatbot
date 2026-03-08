import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Calendar, BookOpen, Briefcase, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                    setUnreadCount(data.filter(n => !n.is_read).length);
                }
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = async (n) => {
        // Navigate immediately for better UX
        if (n.link) {
            navigate(n.link);
            setIsOpen(false);
        }

        // Mark as read in background if needed
        if (!n.is_read) {
            try {
                const token = localStorage.getItem('token');
                // We don't necessarily need to WAIT for the server to navigate
                fetch(`http://localhost:5000/api/notifications/${n.id}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Update local state immediately
                setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.error('Error marking as read:', err);
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'event': return <Calendar size={16} color="#3B82F6" />;
            case 'material': return <BookOpen size={16} color="#10B981" />;
            case 'placement': return <Briefcase size={16} color="#F59E0B" />;
            default: return <Info size={16} color="#94A3B8" />;
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '8px',
                        height: '8px',
                        background: '#EF4444',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-surface)'
                    }} />
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: isMobile ? 'fixed' : 'absolute',
                    top: isMobile ? '70px' : 'calc(100% + 10px)',
                    right: isMobile ? '16px' : 0,
                    left: isMobile ? '16px' : 'auto',
                    width: isMobile ? 'auto' : '320px',
                    maxWidth: isMobile ? 'calc(100vw - 32px)' : '320px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(59, 130, 246, 0.05)'
                    }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Notifications
                        </span>
                        <X size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                <p>No new notifications</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    style={{
                                        padding: '16px',
                                        borderBottom: '1px solid var(--border)',
                                        display: 'flex',
                                        gap: '12px',
                                        transition: 'all 0.2s',
                                        cursor: n.link ? 'pointer' : 'default',
                                        background: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.03)'
                                    }}
                                    onMouseEnter={e => {
                                        if (n.link) e.currentTarget.style.background = 'var(--bg-card-hover)';
                                    }}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        marginTop: '2px',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: n.is_read ? 'var(--text-primary)' : '#60A5FA' }}>{n.title}</p>
                                            {!n.is_read && <div style={{ width: '6px', height: '6px', background: '#3B82F6', borderRadius: '50%' }} />}
                                        </div>
                                        <p style={{ margin: 0, fontSize: '12px', color: n.is_read ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: '1.4' }}>{n.message}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {n.link && <ArrowRight size={12} color="#3B82F6" />}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{
                        padding: '12px',
                        textAlign: 'center',
                        background: 'var(--bg-surface)',
                        borderTop: '1px solid var(--border)'
                    }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Stay updated with campus life</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
