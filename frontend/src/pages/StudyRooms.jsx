import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageSquare, ArrowRight, BookOpen, Hash, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';

const StudyRooms = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [roomName, setRoomName] = useState('');
    const [topic, setTopic] = useState('General Study');
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/rooms/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setRooms(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!roomName) return;

        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/rooms/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: roomName, topic })
            });
            const data = await res.json();
            if (res.ok) {
                setRooms([data, ...rooms]);
                setRoomName('');
                addToast('Study room created!', 'success');
                navigate(`/study-room/${data.id}`);
            } else {
                addToast(data.error || 'Failed to create room', 'error');
            }
        } catch (err) {
            addToast('Network error', 'error');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full max-w-6xl mx-auto">
            <div className="mb-12 animate-in slide-in-from-left duration-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        <Users size={28} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Study Rooms</h1>
                </div>
                <p className="text-[var(--text-muted)] text-sm font-medium max-w-md">
                    Join live collaborative sessions with your peers to share knowledge and solve doubts in real-time.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Room Card */}
                <div className="lg:col-span-1">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl sticky top-8">
                        <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
                            <Plus className="text-orange-400" size={24} />
                            Create Room
                        </h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">Room Name</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input
                                        type="text" required maxLength={20}
                                        value={roomName} onChange={e => setRoomName(e.target.value)}
                                        placeholder="e.g. Exam Prep"
                                        className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl pl-10 pr-4 py-4 outline-none focus:border-orange-500 text-sm text-[var(--text-primary)] font-bold transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">Topic</label>
                                <input
                                    type="text" required
                                    value={topic} onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g. Operating Systems"
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl px-4 py-4 outline-none focus:border-orange-500 text-sm text-[var(--text-primary)] font-bold transition-all"
                                />
                            </div>
                            <button
                                disabled={creating}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
                            >
                                {creating ? <Loader2 className="animate-spin" size={18} /> : <>Start Session <ArrowRight size={18} /></>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Active Rooms List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2 px-2">
                        <MessageSquare className="text-blue-400" size={24} />
                        Active Sessions
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin text-orange-500" size={40} strokeWidth={2.5} />
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="p-12 text-center bg-[var(--bg-card)] rounded-[2.5rem] border border-dashed border-[var(--border)]">
                            <p className="text-[var(--text-muted)] font-bold">No active sessions. Be the first to start one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rooms.map(room => (
                                <div
                                    key={room.id}
                                    onClick={() => navigate(`/study-room/${room.id}`)}
                                    className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 hover:border-orange-500/30 transition-all cursor-pointer shadow-lg hover:shadow-orange-500/5"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-white/5 rounded-xl text-orange-400 group-hover:scale-110 transition-transform">
                                            <Hash size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] mb-1 group-hover:text-orange-400 transition-colors uppercase tracking-tight">{room.name}</h3>
                                    <p className="text-[var(--text-muted)] text-xs font-bold mb-6 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        {room.topic}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{room.participants} Online</span>
                                        <span className="text-orange-400 text-xs font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Join Now <ChevronRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyRooms;
