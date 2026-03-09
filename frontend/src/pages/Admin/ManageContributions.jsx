import React, { useEffect, useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { Eye, CheckCircle, XCircle, User, Calendar, Book, Layers, Loader2 } from 'lucide-react';
import { BASE_URL } from '../../services/api';

const ManageContributions = () => {
    const { addToast } = useToast();
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    const loadPending = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/materials/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setPending(data.items || []);
        } catch (err) {
            addToast('Failed to load contributions', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPending();
    }, []);

    const handleAction = async (id, status) => {
        setActionId(id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE_URL}/materials/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                addToast(`Material ${status === 'approved' ? 'published' : 'rejected'}`, 'success');
                setPending(p => p.filter(item => item.id !== id));
            } else {
                addToast('Failed to update status', 'error');
            }
        } catch (err) {
            addToast('Network error', 'error');
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full">
            <div className="mb-10 animate-in slide-in-from-left duration-500">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Pending Contributions</h1>
                <p className="text-[var(--text-muted)] font-medium text-sm">Review and moderate materials submitted by students before they go live.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={48} strokeWidth={2.5} />
                    <p className="text-[var(--text-muted)] font-bold animate-pulse">Syncing Contributions...</p>
                </div>
            ) : pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-[var(--bg-card)] rounded-[2.5rem] border border-dashed border-[var(--border)] transition-all">
                    <div className="w-20 h-20 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-600 mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <p className="text-xl font-black text-[var(--text-primary)] mb-2">No Pending Approvals</p>
                    <p className="text-[var(--text-muted)] text-sm max-w-xs font-medium leading-relaxed">Everything is up to date. New student contributions will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {pending.map(item => (
                        <div key={item.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-6 hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                        {item.type}
                                    </div>
                                    <div className="bg-slate-500/10 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-500/20">
                                        SEM {item.semester}
                                    </div>
                                </div>

                                <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-2 group-hover:text-blue-400 transition-colors leading-tight">{item.title}</h3>
                                <p className="text-[var(--text-muted)] text-sm font-medium mb-5">{item.subject}</p>

                                <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-blue-400">
                                            <User size={14} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Contributor</p>
                                            <p className="text-xs font-bold text-[var(--text-primary)] truncate">{item.contributor_name || 'Anonymous'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-right">
                                        <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-amber-400">
                                            <Calendar size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-left">Submitted</p>
                                            <p className="text-xs font-bold text-[var(--text-primary)]">New Contribution</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-[var(--border)] pt-5 md:pt-0 md:pl-6 min-w-[140px]">
                                <button
                                    onClick={() => window.open(item.fileUrl, '_blank')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] font-black text-xs rounded-xl border border-[var(--border)] transition-all"
                                >
                                    <Eye size={14} /> Preview
                                </button>
                                <button
                                    disabled={actionId === item.id}
                                    onClick={() => handleAction(item.id, 'approved')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-400 text-white font-black text-xs rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
                                >
                                    {actionId === item.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />} Approve
                                </button>
                                <button
                                    disabled={actionId === item.id}
                                    onClick={() => handleAction(item.id, 'rejected')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black text-xs rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                                >
                                    <XCircle size={14} /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageContributions;
