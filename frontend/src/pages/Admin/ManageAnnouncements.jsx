import React, { useEffect, useState } from 'react';
import { useToast } from '../../components/ui/Toast';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, updateAnnouncement } from '../../services/announcementService';
import AnnouncementCard from '../../components/Announcement/AnnouncementCard';
import Pagination from '../../components/Common/Pagination';

const ManageAnnouncements = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [show, setShow] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const { toast, ToastContainer } = useToast();

    const getLimit = () => {
        if (window.innerWidth < 768) return 5;
        if (window.innerWidth < 1024) return 6;
        return 9;
    };

    const [limit, setLimit] = useState(getLimit());

    const load = () => {
        setLoading(true);
        getAnnouncements(page, limit)
            .then(res => {
                setItems(res.items || []);
                setTotalPages(res.pages || 1);
                setTotalItems(res.total || 0);
            })
            .catch(() => toast.error('Failed to load announcements.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        const handleResize = () => {
            const newLimit = getLimit();
            if (newLimit !== limit) setLimit(newLimit);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [limit]);

    useEffect(load, [page, limit]);

    const handleEdit = (item) => {
        setEditingItem(item);
        setTitle(item.title);
        setContent(item.content);
        setShow(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasDateTime = (text) => {
        const patterns = [
            /\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/, // 12-03-2024 or 12.03.24
            /\d{1,2}[:.]\d{2}/,                 // 10:00 or 10.30
            /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)/i,
            /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/i,
            /(am|pm|today|tomorrow|at\s+\d|o'clock|noon|evening|morning)/i,
            /(\d{1,2}(st|nd|rd|th))/i           // 1st, 2nd, etc.
        ];
        return patterns.some(p => p.test(text));
    };

    const save = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return toast.warning('Title and content are required.');

        if (!hasDateTime(content)) {
            return toast.error('⚠️ ACTION BLOCKED: Please enter a Date, Day, or Timing in the description (e.g. "Monday at 10 AM").');
        }

        setSaving(true);
        try {
            if (editingItem) {
                await updateAnnouncement(editingItem.id || editingItem._id, { title, content });
                toast.success('Announcement updated!');
            } else {
                await createAnnouncement({ title, content });
                toast.success('Announcement posted!');
            }
            setTitle('');
            setContent('');
            setShow(false);
            setEditingItem(null);
            load();
        } catch {
            toast.error('Failed to save announcement.');
        } finally {
            setSaving(false);
        }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await deleteAnnouncement(id);
            load();
            toast.success('Announcement removed.');
        } catch {
            toast.error('Failed to delete.');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)', boxSizing: 'border-box' }}>
            <ToastContainer />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(22px, 5vw, 26px)', margin: '0 0 4px' }}>📢 Manage Announcements</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>{totalItems} announcement{totalItems !== 1 ? 's' : ''} (Page {page} of {totalPages})</p>
                </div>
                <button onClick={() => {
                    if (show) { setShow(false); setEditingItem(null); setTitle(''); setContent(''); }
                    else setShow(true);
                }}
                    style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', background: show ? '#1F2937' : '#3B82F6', color: '#fff' }}>
                    {show ? '✕ Cancel' : '+ New Announcement'}
                </button>
            </div>

            {show && (
                <form onSubmit={save} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>{editingItem ? '✏️ Edit Announcement' : '📢 Post New Announcement'}</h3>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Title</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="e.g. Semester Exam Schedule" />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase' }}>Content (Please include Date & Time here)</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="input" placeholder="e.g. The meeting is scheduled for March 12th at 10:00 AM in the Main Hall..." style={{ resize: 'none' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px' }}>* Mentioning explicit dates and times helps the AI assistant provide accurate info.</p>
                    </div>
                    <button type="submit" disabled={saving} style={{ padding: '10px 28px', borderRadius: '8px', fontWeight: 700, background: saving ? '#1F2937' : '#3B82F6', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        {saving ? 'Saving...' : editingItem ? 'Update Announcement' : 'Post Announcement'}
                    </button>
                </form>
            )}

            {loading ? (
                <div style={{ spaceY: '12px' }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: '80px', background: 'var(--bg-card)', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--border)' }} />)}
                </div>
            ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B' }}>
                    <p>No announcements yet.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {items.map(a => (
                            <div key={a.id || a._id} style={{ position: 'relative' }}
                                onMouseEnter={e => {
                                    e.currentTarget.querySelectorAll('button').forEach(b => b.style.opacity = '1');
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.querySelectorAll('button').forEach(b => b.style.opacity = '0');
                                }}>
                                <AnnouncementCard announcement={a} />
                                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleEdit(a)}
                                        style={{ background: '#3B82F6', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', opacity: 0, transition: '0.2s' }}>
                                        Edit
                                    </button>
                                    <button onClick={() => del(a.id || a._id)}
                                        style={{ background: '#EF4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', opacity: 0, transition: '0.2s' }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
};

export default ManageAnnouncements;
