import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, ArrowLeft, Ticket, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../../services/api';

const EventHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState(null);

    useEffect(() => {
        if (user) {
            apiFetch(`/history/my-history`)
                .then(data => {
                    setHistory(Array.isArray(data) ? data : []);
                })
                .catch(err => console.error('Error fetching history:', err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const TicketModal = ({ reg, onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Ticket Header */}
                <div className={`p-8 text-white text-center relative ${reg.status === 'attended' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                    <div className={`absolute top-0 left-0 w-full h-full blur-3xl rounded-full ${reg.status === 'attended' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`} />
                    <Ticket className="mx-auto mb-4 relative z-10" size={48} strokeWidth={1.5} />
                    <h2 className="text-2xl font-black relative z-10 mb-1">{reg.status === 'attended' ? 'Verified Ticket' : 'Entry Ticket'}</h2>
                    <p className={`text-xs font-bold uppercase tracking-widest relative z-10 ${reg.status === 'attended' ? 'text-emerald-100' : 'text-blue-100'}`}>
                        {reg.status === 'attended' ? '✅ Attendance Confirmed' : 'Scan at entrance'}
                    </p>
                </div>

                {/* Ticket Body */}
                <div className="p-8 flex flex-col items-center bg-white relative">
                    {/* QR Code Container */}
                    <div className="p-4 bg-slate-50 rounded-3xl border-2 border-slate-100 mb-6 shadow-inner">
                        <QRCodeSVG
                            value={reg.registration_id}
                            size={180}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    <div className="w-full space-y-4 mb-2">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event</p>
                            <p className="text-sm font-bold text-slate-900">{reg.event_title}</p>
                        </div>
                        <div className="flex gap-4 border-t border-slate-100 pt-4">
                            <div className="flex-1 text-center border-r border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendee</p>
                                <p className="text-[11px] font-bold text-slate-900">{user?.name}</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID</p>
                                <p className="text-[11px] font-mono font-bold text-blue-600 truncate px-2">{reg.registration_id.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Ticket Edges */}
                <div className="relative h-4 bg-slate-100 flex items-center justify-between">
                    <div className="w-6 h-6 rounded-full bg-black/80 -ml-3" />
                    <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-2" />
                    <div className="w-6 h-6 rounded-full bg-black/80 -mr-3" />
                </div>

                <div className="p-4 bg-slate-100 text-center">
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-tighter">CampusAI Digital Verification System</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(22px, 5vw, 28px)', margin: 0 }}>Event History</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>Your journey through campus events</p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', padding: '100px', justifyContent: 'center' }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : history.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📜</div>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>No history found</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto 24px' }}>You haven't registered for any events yet. Ready to start your adventure?</p>
                    <button
                        onClick={() => navigate('/events')}
                        style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Explore Events
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {history.map((item, idx) => (
                        <div key={item.id || idx} style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                            className="group"
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                        >
                            {/* Icon / Status */}
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: item.type === 'registration' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)',
                                border: `1px solid ${item.type === 'registration' ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.2)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: item.type === 'registration' ? '#3B82F6' : '#22C55E'
                            }}>
                                {item.type === 'registration' ? <Calendar size={24} /> : <CheckCircle size={24} />}
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '16px', margin: 0 }}>{item.event_title}</h3>
                                    <span style={{
                                        fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                                        padding: '2px 8px', borderRadius: '6px',
                                        background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)'
                                    }}>
                                        {item.status || 'Confirmed'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={14} />
                                        <span>Event Date: {item.event_date || 'TBD'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={14} />
                                        <span>Logged: {item.timestamp}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            {item.type === 'registration' && item.registration_id && (
                                <button
                                    onClick={() => setSelectedReg(item)}
                                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-blue-500/20"
                                >
                                    <Ticket size={14} /> View Ticket
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedReg && <TicketModal reg={selectedReg} onClose={() => setSelectedReg(null)} />}
        </div>
    );
};

export default EventHistory;
