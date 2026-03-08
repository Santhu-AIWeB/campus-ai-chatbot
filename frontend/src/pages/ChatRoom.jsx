import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Users, Hash, ShieldAlert, Clock } from 'lucide-react';

const ChatRoom = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [room, setRoom] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/rooms/${roomId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRoom(data);
                }
            } catch (err) {
                console.error("Failed to fetch room details");
            }
        };
        fetchRoomDetails();

        socket.connect();
        socket.emit('join', { username: user?.name || 'Anonymous', room: roomId });

        socket.on('message', (data) => {
            setMessages(prev => [...prev, { ...data, type: 'chat' }]);
        });

        socket.on('status', (data) => {
            setMessages(prev => [...prev, { ...data, type: 'status' }]);
        });

        return () => {
            socket.emit('leave', { username: user?.name || 'Anonymous', room: roomId });
            socket.off('message');
            socket.off('status');
            socket.disconnect();
        };
    }, [roomId, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (input.trim()) {
            socket.emit('message', {
                room: roomId,
                username: user?.name,
                message: input,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setInput('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden">
            {/* Header */}
            <div className="bg-[var(--bg-card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between shadow-lg z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/study-rooms')} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-orange-400"><Hash size={18} strokeWidth={3} /></span>
                            <h2 className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight uppercase">{room ? room.name : 'Loading...'}</h2>
                        </div>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {room ? room.topic : 'Connecting...'}
                        </p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                        <Users size={14} className="text-blue-400" />
                        <span className="text-xs font-black text-[var(--text-primary)]">ACTIVE SESSION</span>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.map((msg, i) => (
                    msg.type === 'status' ? (
                        <div key={i} className="flex justify-center my-4 animate-in fade-in duration-500">
                            <div className="bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-slate-500/20">
                                {msg.msg}
                            </div>
                        </div>
                    ) : (
                        <div key={i} className={`flex flex-col ${msg.username === user?.name ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{msg.username}</span>
                                <span className="text-[9px] font-bold text-slate-600">{msg.timestamp}</span>
                            </div>
                            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium shadow-md ${msg.username === user?.name
                                ? 'bg-orange-600 text-white rounded-tr-none'
                                : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-none'
                                }`}>
                                {msg.message}
                            </div>
                        </div>
                    )
                ))}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border)]">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message or share a link..."
                            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none focus:border-orange-500 text-sm font-bold text-[var(--text-primary)] transition-all pr-12"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-orange-400 hover:scale-110 transition-transform">
                            <Clock size={20} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition-all shadow-xl shadow-orange-600/20 disabled:opacity-50"
                    >
                        <Send size={24} />
                    </button>
                </form>
                <p className="text-center text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-3">Messages are end-to-end encrypted within your campus network</p>
            </div>
        </div>
    );
};

export default ChatRoom;
