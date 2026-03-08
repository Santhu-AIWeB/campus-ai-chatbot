import React, { useEffect, useState, useCallback } from 'react';

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const ACCENT = {
    success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', color: '#4ADE80' },
    error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#F87171' },
    warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#FCD34D' },
    info: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', color: '#60A5FA' },
};

const ToastItem = ({ id, type = 'success', message, onRemove }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setVisible(true), 10);
        const t2 = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(id), 350);
        }, 3500);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [id, onRemove]);

    const a = ACCENT[type] || ACCENT.info;

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            minWidth: '280px', maxWidth: '360px',
            background: '#111827',
            border: `1px solid ${a.border}`,
            borderLeft: `4px solid ${a.color}`,
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-20px)',
            pointerEvents: 'all',
        }}>
            <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>
                {ICONS[type]}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#F8FAFC', fontWeight: 700, fontSize: '13px', margin: '0 0 2px', textTransform: 'capitalize' }}>
                    {type}
                </p>
                <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{message}</p>
            </div>
            <button onClick={() => { setVisible(false); setTimeout(() => onRemove(id), 350); }}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1, flexShrink: 0 }}>
                ✕
            </button>
        </div>
    );
};

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const add = useCallback((type, message) => {
        const id = Date.now() + Math.random();
        setToasts(p => [...p, { id, type, message }]);
    }, []);

    const remove = useCallback((id) => {
        setToasts(p => p.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => add('success', msg),
        error: (msg) => add('error', msg),
        warning: (msg) => add('warning', msg),
        info: (msg) => add('info', msg),
    };

    const addToast = useCallback((message, type = 'success') => {
        add(type, message);
    }, [add]);

    const ToastContainer = () => (
        <div style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center',
            pointerEvents: 'none', width: '100%', maxWidth: '400px'
        }}>
            {toasts.map(t => (
                <ToastItem key={t.id} {...t} onRemove={remove} />
            ))}
        </div>
    );

    return { toast, addToast, ToastContainer };
};

export default useToast;
