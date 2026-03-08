import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const data = await apiLogin(email, password);
            login(data.token, data.role);
            navigate('/');
        } catch { setError('Invalid email or password. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden', padding: '24px' }}>

            {/* ── Background Mesh ── */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', animation: 'float-slow 20s infinite alternate' }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)', animation: 'float-slow 25s infinite alternate-reverse' }} />
            </div>

            {/* ── Floating Icons ── */}
            <div style={{ position: 'absolute', top: '15%', left: '10%', fontSize: '48px', opacity: 0.3, animation: 'float-slow 8s infinite ease-in-out', zIndex: 1 }} className="hidden md:block">🎓</div>
            <div style={{ position: 'absolute', bottom: '20%', left: '15%', fontSize: '40px', opacity: 0.2, animation: 'float-slow 12s infinite ease-in-out reverse', zIndex: 1 }} className="hidden md:block">📚</div>
            <div style={{ position: 'absolute', top: '25%', right: '12%', fontSize: '44px', opacity: 0.25, animation: 'float-slow 10s infinite ease-in-out 1s', zIndex: 1 }} className="hidden md:block">🤖</div>

            {/* ── Glass Card ── */}
            <div style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px',
                background: 'var(--bg-card)', backdropFilter: 'blur(16px)',
                border: '1px solid var(--border)', borderRadius: '24px',
                padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                animation: 'entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: 'auto', height: '80px', margin: '0 auto 24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <img src="/college_logo.png" alt="IARE Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Welcome back, student!</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '14px', borderRadius: '12px', fontSize: '13px', marginBottom: '24px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px', marginLeft: '4px' }}>College Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="you@campus.edu" required className="input"
                            style={{ height: '48px', borderRadius: '14px' }}
                        />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', marginLeft: '4px' }}>
                            <label style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600 }}>Password</label>
                            <Link to="#" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}>Forgot?</Link>
                        </div>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••" required className="input"
                            style={{ height: '48px', borderRadius: '14px' }}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary"
                        style={{ width: '100%', height: '52px', marginTop: '12px', borderRadius: '14px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {loading ? 'Entering Campus…' : 'Sign In to Portal'}
                        {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        New student?{' '}
                        <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
                    </p>
                </form>
            </div>

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(5deg); }
                }
                @keyframes entrance {
                    0% { opacity: 0; transform: translateY(20px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .input:focus {
                    border-color: var(--accent) !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
                    background: var(--bg-surface) !important;
                }
            `}</style>
        </div>
    );
};
export default Login;
