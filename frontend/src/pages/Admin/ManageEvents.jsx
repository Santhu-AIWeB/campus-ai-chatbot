import React, { useEffect, useState } from 'react';
import EventCard from '../../components/Event/EventCard';
import { useToast } from '../../components/ui/Toast';
import { getEvents, createEvent, deleteEvent, updateEvent } from '../../services/eventService';
import Pagination from '../../components/Common/Pagination';

const EMPTY = { title: '', description: '', date: '', location: '', semester: 'All' };
const LBL = { display: 'block', color: '#64748B', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' };

const ManageEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [show, setShow] = useState(false);
    const [form, setForm] = useState(EMPTY);
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
        getEvents(page, limit)
            .then(res => {
                setEvents(res.items || []);
                setTotalPages(res.pages || 1);
                setTotalItems(res.total || 0);
            })
            .catch(() => toast.error('Failed to load events.'))
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

    const handleEdit = (ev) => {
        setEditingItem(ev);
        setForm({
            title: ev.title || '',
            description: ev.description || '',
            date: ev.date || '',
            location: ev.location || '',
            semester: ev.semester || 'All'
        });
        setShow(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const save = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.warning('Event title is required.');
        setSaving(true);
        try {
            if (editingItem) {
                await updateEvent(editingItem.id || editingItem._id, form);
                toast.success('Event updated successfully!');
            } else {
                await createEvent(form);
                toast.success('Event created successfully!');
            }
            setForm(EMPTY);
            setShow(false);
            setEditingItem(null);
            load();
        } catch (err) {
            toast.error('Failed to save event. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await deleteEvent(id);
            load();
            toast.success('Event deleted.');
        } catch {
            toast.error('Failed to delete event.');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)', boxSizing: 'border-box' }}>
            <ToastContainer />

            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(22px, 5vw, 26px)', margin: '0 0 4px' }}>📅 Manage Events</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>{totalItems} total event{totalItems !== 1 ? 's' : ''} (Page {page} of {totalPages})</p>
                </div>
                <button onClick={() => {
                    if (show) { setShow(false); setEditingItem(null); setForm(EMPTY); }
                    else setShow(true);
                }}
                    style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', background: show ? '#1F2937' : '#3B82F6', color: '#fff', transition: 'background 0.15s' }}>
                    {show ? '✕ Cancel' : '+ Add Event'}
                </button>
            </div>

            {/* Form */}
            {show && (
                <form onSubmit={save} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>{editingItem ? '✏️ Edit Event' : '📅 Create New Event'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
                        <div><label style={LBL}>Title *</label><input name="title" type="text" value={form.title} onChange={set} required className="input" placeholder="Event title" /></div>
                        <div><label style={LBL}>Location</label><input name="location" type="text" value={form.location} onChange={set} className="input" placeholder="Main Auditorium" /></div>
                        <div><label style={LBL}>Date</label><input name="date" type="date" value={form.date} onChange={set} className="input" /></div>
                        <div>
                            <label style={LBL}>Target Semester</label>
                            <select name="semester" value={form.semester} onChange={set} className="input">
                                <option value="All">All Semesters</option>
                                {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(s => (
                                    <option key={s} value={s}>{`Semester ${s}`}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}><label style={LBL}>Description</label><textarea name="description" value={form.description} onChange={set} rows={3} className="input" style={{ resize: 'none' }} placeholder="What is this event about?" /></div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <button type="submit" disabled={saving}
                                style={{ padding: '10px 28px', borderRadius: '8px', fontWeight: 700, fontSize: '14px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? '#1F2937' : '#3B82F6', color: saving ? '#64748B' : '#fff' }}>
                                {saving ? 'Saving…' : editingItem ? 'Update Event' : 'Save Event'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '12px', overflow: 'hidden' }}>
                            <div style={{ height: '140px', background: '#1F2937' }} />
                            <div style={{ padding: '16px' }}><div style={{ height: '16px', borderRadius: '6px', background: '#1F2937', marginBottom: '8px' }} /></div>
                        </div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '56px', marginBottom: '12px' }}>📭</div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>No events yet</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Add one or check another page.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
                        {events.map(ev => (
                            <div key={ev.id || ev._id} style={{ position: 'relative' }}
                                onMouseEnter={e => {
                                    e.currentTarget.querySelectorAll('[data-del]').forEach(b => b.style.opacity = '1');
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.querySelectorAll('[data-del]').forEach(b => b.style.opacity = '0');
                                }}>
                                <EventCard event={ev} />
                                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                                    <button data-del onClick={() => handleEdit(ev)}
                                        style={{ background: 'rgba(59,130,246,0.9)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}>
                                        Edit
                                    </button>
                                    <button data-del onClick={() => del(ev.id || ev._id)}
                                        style={{ background: 'rgba(239,68,68,0.85)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}>
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

export default ManageEvents;
