import React, { useEffect, useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { apiFetch } from '../../services/api';
import { Users, ShieldCheck, Search, Loader2 } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const { toast, ToastContainer } = useToast();

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/auth/users');
            setUsers(data || []);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);


    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)' }}>
            <ToastContainer />

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-3">
                        <Users className="text-blue-500" size={32} />
                        Manage Users
                    </h1>
                    <p className="text-[var(--text-muted)] text-sm mt-1">Found {users.length} registered users</p>
                </div>

                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500/50 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                    <p className="text-slate-500 font-bold">Loading user directory...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-20 text-center">
                    <Users className="mx-auto text-slate-800 mb-4" size={48} />
                    <p className="text-[var(--text-primary)] font-bold">No users found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map(u => (
                        <div key={u.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-blue-500/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                    {u.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="text-[var(--text-primary)] font-bold flex items-center gap-2">
                                        {u.name}
                                        {u.role === 'admin' && <ShieldCheck size={16} className="text-amber-500" />}
                                    </h3>
                                    <p className="text-slate-500 text-xs">{u.email}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                                            {u.role}
                                        </span>
                                        {u.semester && (
                                            <span className="text-[10px] font-black uppercase text-slate-500">
                                                Sem {u.semester}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {u.role === 'admin' && (
                                <div className="text-amber-500 text-[10px] font-black uppercase flex items-center gap-2 mr-4">
                                    <ShieldCheck size={14} />
                                    Authorized Admin
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
