import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student', semester: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        setLoading(true); setError('');
        try {
            const r = await fetch('/api/auth/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                    semester: form.role === 'student' ? form.semester : ''
                }),
            });
            const rd = await r.json();
            if (!r.ok) throw new Error(rd.error || 'Registration failed');

            const lr = await fetch('/api/auth/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const ld = await lr.json();
            if (!lr.ok) throw new Error(ld.error || 'Login after register failed');

            login(ld.token, ld.role);
            navigate('/');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden', padding: '24px' }}>

            {/* ── Background Mesh ── */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', animation: 'float-slow 20s infinite alternate' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)', animation: 'float-slow 25s infinite alternate-reverse' }} />
            </div>

            {/* ── Floating Icons ── */}
            <div style={{ position: 'absolute', top: '10%', right: '15%', fontSize: '48px', opacity: 0.3, animation: 'float-slow 8s infinite ease-in-out', zIndex: 1 }} className="hidden md:block">📝</div>
            <div style={{ position: 'absolute', bottom: '15%', right: '10%', fontSize: '40px', opacity: 0.2, animation: 'float-slow 12s infinite ease-in-out reverse', zIndex: 1 }} className="hidden md:block">🎓</div>
            <div style={{ position: 'absolute', top: '20%', left: '12%', fontSize: '44px', opacity: 0.25, animation: 'float-slow 10s infinite ease-in-out 1.5s', zIndex: 1 }} className="hidden md:block">🚀</div>

            {/* ── Glass Card ── */}
            <div style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px',
                background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--border)', borderRadius: '24px',
                padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                animation: 'entrance 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: 'auto', height: '76px', margin: '0 auto 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <img src="/college_logo.png" alt="IARE Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Start your smart academic journey today.</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginLeft: '4px' }}>Full Name</label>
                        <input name="name" type="text" value={form.name} onChange={set} required className="input" placeholder="e.g. Alex Johnson"
                            style={{ height: '46px', borderRadius: '12px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginLeft: '4px' }}>College Email</label>
                        <input name="email" type="email" value={form.email} onChange={set} required className="input" placeholder="you@campus.edu"
                            style={{ height: '46px', borderRadius: '12px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginLeft: '4px' }}>Password</label>
                            <input name="password" type="password" value={form.password} onChange={set} required className="input" placeholder="••••••••"
                                style={{ height: '46px', borderRadius: '12px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginLeft: '4px' }}>Confirm</label>
                            <input name="confirm" type="password" value={form.confirm} onChange={set} required className="input" placeholder="••••••••"
                                style={{ height: '46px', borderRadius: '12px' }}
                            />
                        </div>
                    </div>

                    {form.role === 'student' && (
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginLeft: '4px' }}>Current Semester</label>
                            <select name="semester" value={form.semester} onChange={set} required className="input"
                                style={{ height: '46px', borderRadius: '12px' }}>
                                <option value="">Select Semester</option>
                                <option value="I">Semester I</option>
                                <option value="II">Semester II</option>
                                <option value="III">Semester III</option>
                                <option value="IV">Semester IV</option>
                                <option value="V">Semester V</option>
                                <option value="VI">Semester VI</option>
                                <option value="VII">Semester VII</option>
                                <option value="VIII">Semester VIII</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginLeft: '4px' }}>I am a...</label>
                        <select name="role" value={form.role} onChange={set} className="input"
                            style={{ height: '46px', borderRadius: '12px' }}>
                            <option value="student">Student</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary"
                        style={{ width: '100%', height: '50px', marginTop: '8px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        {loading ? 'Creating Account…' : 'Finalize Registration ✨'}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Already have access?{' '}
                        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </form>
            </div>

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-25px) rotate(3deg); }
                }
                @keyframes entrance {
                    0% { opacity: 0; transform: translateY(30px) scale(0.97); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .input:focus {
                    border-color: var(--accent) !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12) !important;
                    background: var(--bg-surface) !important;
                }
            `}</style>
        </div>
    );
};
export default Register;
