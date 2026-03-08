import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ChatWidget = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMsgs] = useState([
        { id: 1, text: "Hi! I'm your Campus AI 🎓\nAsk me about events, fees, materials or campus life.", sender: 'bot' },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;
        setMsgs(p => [...p, { id: Date.now(), text, sender: 'user' }]);
        setInput('');
        setTyping(true);
        try {
            const res = await fetch('/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, semester: user?.semester })
            });
            const data = await res.json();
            setMsgs(p => [...p, { id: Date.now() + 1, text: data.reply || "Sorry, I didn't get that.", sender: 'bot' }]);
        } catch {
            setMsgs(p => [...p, { id: Date.now() + 1, text: "⚠️ Backend not reachable.", sender: 'bot' }]);
        } finally { setTyping(false); }
    };

    const submit = (e) => { e.preventDefault(); sendMessage(input); };
    const keyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };

    const SUGGESTIONS = ['📅 Upcoming events', '💰 Fee structure', '📚 Study materials', '🕒 Class timings'];

    const renderText = (text) => {
        if (!text) return '';

        // 1. Match markdown links [text](url)
        const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = mdLinkRegex.exec(text)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            // Add the link
            parts.push(
                <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', textDecoration: 'underline' }}>
                    {match[1]}
                </a>
            );
            lastIndex = mdLinkRegex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            const remainingText = text.substring(lastIndex);

            // 2. Match plain URLs in the remaining text
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const subParts = [];
            let subLastIndex = 0;
            let subMatch;

            while ((subMatch = urlRegex.exec(remainingText)) !== null) {
                if (subMatch.index > subLastIndex) {
                    subParts.push(remainingText.substring(subLastIndex, subMatch.index));
                }
                subParts.push(
                    <a key={subMatch.index} href={subMatch[1]} target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', textDecoration: 'underline' }}>
                        {subMatch[1]}
                    </a>
                );
                subLastIndex = urlRegex.lastIndex;
            }

            if (subLastIndex < remainingText.length) {
                subParts.push(remainingText.substring(subLastIndex));
            }

            if (subParts.length > 0) {
                parts.push(...subParts);
            } else {
                parts.push(remainingText);
            }
        }

        return parts.length > 0 ? parts : text;
    };

    return (
        <>
            {/* Panel */}
            <div style={{
                position: 'fixed', bottom: '80px', right: '16px', zIndex: 50,
                width: 'min(360px, calc(100vw - 32px))', maxHeight: '520px',
                background: '#111827',
                border: '1px solid #1F2937',
                borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
                transition: 'all 0.3s ease', transformOrigin: 'bottom right',
                transform: open ? 'scale(1)' : 'scale(0.85)',
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'linear-gradient(90deg, #1D4ED8, #3B82F6)', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎓</div>
                        <div>
                            <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', margin: 0, lineHeight: 1 }}>Campus AI</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite', display: 'inline-block' }} />
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>Always online</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)}
                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: '18px', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}>
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#0F172A', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
                    {messages.map(msg => (
                        <div key={msg.id} style={{ display: 'flex', gap: '8px', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end' }}>
                            {msg.sender === 'bot' && (
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🎓</div>
                            )}
                            <div style={{
                                maxWidth: '78%', padding: '10px 14px', fontSize: '13px', lineHeight: '1.5', whiteSpace: 'pre-line',
                                ...(msg.sender === 'user'
                                    ? { background: '#3B82F6', color: '#FFFFFF', borderRadius: '16px 16px 4px 16px' }
                                    : { background: '#1E293B', color: '#F8FAFC', border: '1px solid #1F2937', borderRadius: '16px 16px 16px 4px' }
                                )
                            }}>
                                {renderText(msg.text)}
                            </div>
                        </div>
                    ))}
                    {typing && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🎓</div>
                            <div style={{ background: '#1E293B', border: '1px solid #1F2937', borderRadius: '16px', padding: '12px 16px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                {[0, 150, 300].map(d => (
                                    <span key={d} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3B82F6', display: 'inline-block', animation: `bounce 1s ${d}ms infinite` }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quick suggestions */}
                {messages.length === 1 && (
                    <div style={{ padding: '8px 12px', background: '#0F172A', borderTop: '1px solid #1F2937', display: 'flex', flexWrap: 'wrap', gap: '6px', flexShrink: 0 }}>
                        {SUGGESTIONS.map(s => (
                            <button key={s} onClick={() => sendMessage(s)}
                                style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '99px', background: '#1E293B', color: '#60A5FA', border: '1px solid #1F2937', cursor: 'pointer', transition: 'border-color 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = '#1F2937'}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input — bg #020617 per spec */}
                <form onSubmit={submit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#111827', borderTop: '1px solid #1F2937', flexShrink: 0 }}>
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={keyDown}
                        placeholder="Type a message…"
                        style={{ flex: 1, background: '#020617', color: '#F8FAFC', border: '1px solid #1F2937', borderRadius: '99px', padding: '9px 16px', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
                        onBlur={e => { e.target.style.borderColor = '#1F2937'; e.target.style.boxShadow = 'none' }} />
                    <button type="submit" disabled={!input.trim() || typing}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: input.trim() && !typing ? '#3B82F6' : '#1F2937', color: '#fff', cursor: input.trim() && !typing ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '15px', height: '15px' }}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                    </button>
                </form>
            </div>

            {/* FAB */}
            <button onClick={() => setOpen(o => !o)}
                style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 50, width: '56px', height: '56px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #2563EB, #3B82F6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59,130,246,0.45)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                className="animate-pulse-glow">
                {open
                    ? <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '22px', height: '22px' }}><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                    : <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '22px', height: '22px' }}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>}
            </button>

            {/* Notification dot */}
            {!open && <span style={{ position: 'fixed', bottom: '54px', right: '12px', zIndex: 50, width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444', border: '2px solid #0B1120', animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite', pointerEvents: 'none' }} />}

            <style>{`
                @keyframes ping { 75%,100% { transform:scale(2); opacity:0; } }
                @keyframes bounce { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
            `}</style>
        </>
    );
};
export default ChatWidget;
