import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const BANNER_COLORS = [
    { from: '#0D2137', to: '#0F172A' },
    { from: '#0C2044', to: '#0F172A' },
    { from: '#0E1B3D', to: '#111827' },
    { from: '#111827', to: '#0B1120' },
    { from: '#0D1F2D', to: '#0F172A' },
];

const EventCard = ({ event }) => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [status, setStatus] = useState('idle');
    const [isRegistered, setIsRegistered] = useState(false);

    const isSemesterMismatch = user?.role === 'student' &&
        event.semester &&
        event.semester !== 'All' &&
        user.semester !== event.semester;

    React.useEffect(() => {
        const checkRegistration = async () => {
            if (!user?.email) return;
            try {
                const res = await fetch(`/api/registrations/event/${event.id || event._id}`);
                const registrations = await res.json();
                const alreadyRegistered = registrations.some(r => r.email === user.email);
                setIsRegistered(alreadyRegistered);
            } catch (err) {
                console.error("Error checking registration:", err);
            }
        };
        checkRegistration();
    }, [event.id, event._id, user?.email]);

    const g = BANNER_COLORS[(event.title?.charCodeAt(0) || 0) % BANNER_COLORS.length];

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        if (isSemesterMismatch) return;

        setStatus('loading');

        const registrationData = {
            name: user ? user.name : form.name,
            email: user ? user.email : form.email,
            semester: user ? user.semester : '', // Send student semester for validation
            event_id: event.id || event._id
        };

        try {
            const res = await fetch('/api/registrations/', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData),
            });
            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 409) {
                    setIsRegistered(true);
                    setStatus('success');
                    return;
                }
                throw new Error(errorData.error || 'Registration failed');
            }
            setStatus('success');
            setIsRegistered(true);
            if (user) {
                setTimeout(() => setStatus('idle'), 2000);
            }
        } catch (err) {
            setStatus('error');
            alert(err.message || "Registration failed. Please try again.");
            if (user) setStatus('idle');
        }
    };

    const close = () => { setShowModal(false); setStatus('idle'); setForm({ name: user?.name || '', email: user?.email || '' }); };

    const CS = {
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'all 0.25s ease', cursor: 'default',
    };

    const getBtnStatus = () => {
        if (isRegistered) return { text: '✅ Registered', color: '#059669', disabled: true };
        if (isSemesterMismatch) return { text: `🔒 Semester ${event.semester} only`, color: '#374151', disabled: true };
        if (status === 'loading') return { text: '⏳ Registering...', color: '#1E3A8A', disabled: true };
        return { text: '✅ Register for Event', color: '#3B82F6', disabled: false };
    };

    const btn = getBtnStatus();

    return (
        <>
            <div style={CS}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>

                <div style={{ position: 'relative', width: '100%', height: '140px', background: `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', filter: 'blur(24px)' }} />
                    <span style={{ fontSize: '56px', opacity: 0.25, userSelect: 'none' }}>📅</span>
                    {event.date && (
                        <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#CBD5E1', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px' }}>
                            🗓 {event.date}
                        </span>
                    )}
                    {event.semester && event.semester !== 'All' && (
                        <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60A5FA', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase' }}>
                            🎓 Sem {event.semester}
                        </span>
                    )}
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '6px' }}>
                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px', margin: 0 }}>{event.title}</h3>
                    {event.location && <p style={{ color: 'var(--text-disabled)', fontSize: '12px', margin: 0 }}>📍 {event.location}</p>}
                    {event.description && <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, flex: 1 }}>{event.description}</p>}

                    {user?.role !== 'admin' && (
                        <button
                            onClick={(e) => {
                                if (btn.disabled) return;
                                if (user) handleRegister(e);
                                else setShowModal(true);
                            }}
                            disabled={btn.disabled}
                            style={{
                                marginTop: '10px', width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                                background: btn.color, color: '#fff', fontSize: '13px', fontWeight: 600,
                                cursor: btn.disabled ? 'default' : 'pointer', transition: 'all 0.15s',
                                opacity: btn.disabled ? 0.7 : 1
                            }}>
                            {btn.text}
                        </button>
                    )}
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(10px)' }} onClick={close}>
                    <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-overlay)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} onClick={e => e.stopPropagation()}>
                        {status === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                                <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '22px' }}>You're In!</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Reservation confirmed for <strong style={{ color: '#3B82F6' }}>{event.title}</strong></p>
                                <button onClick={close} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>Great, thanks!</button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '20px' }}>Event Registration</h3>
                                    <button onClick={close} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                                </div>
                                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" required className="input" />
                                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" required className="input" />
                                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Secure my Spot</button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
export default EventCard;
