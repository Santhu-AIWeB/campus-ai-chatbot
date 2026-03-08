import React, { useEffect, useState, useRef } from 'react';
import MaterialCard from '../../components/Material/MaterialCard';
import { useToast } from '../../components/ui/Toast';
import { getQuestionPapers, deleteQuestionPaper, updateQuestionPaper } from '../../services/questionPaperService';
import Pagination from '../../components/Common/Pagination';

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const ACCEPT = '.pdf,.ppt,.pptx,.doc,.docx,.mp4,.mkv,.jpg,.jpeg,.png,.txt,.zip';
const LBL = { display: 'block', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' };

const ManageQuestionPapers = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [show, setShow] = useState(false);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    const [semester, setSemester] = useState('I');
    const fileRef = useRef(null);
    const { toast, ToastContainer } = useToast();

    const limit = 9;

    const load = () => {
        setLoading(true);
        getQuestionPapers(page, limit)
            .then(res => {
                setItems(res.items || []);
                setTotalPages(res.pages || 1);
                setTotalItems(res.total || 0);
            })
            .catch(() => toast.error('Failed to load papers.'))
            .finally(() => setLoading(false));
    };

    useEffect(load, [page]);

    const fmtSize = (b) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b > 1e3 ? `${(b / 1e3).toFixed(0)} KB` : `${b} B`;

    const chooseFile = (f) => {
        if (!f) return;
        setFile(f);
        if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setTitle(item.title || '');
        setSubject(item.subject || '');
        setShow(true);
        setFile(null);
        setSemester(item.semester || 'I');
        if (fileRef.current) fileRef.current.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAction = async (e) => {
        e.preventDefault();
        setSaving(true);
        setProgress(0);

        try {
            if (editingItem) {
                await updateQuestionPaper(editingItem.id || editingItem._id, { title, subject, semester });
                toast.success('Paper updated successfully!');
            } else {
                if (!file) { toast.warning('Please select a file.'); setSaving(false); return; }

                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/question-papers/');
                    xhr.upload.onprogress = (ev) => {
                        if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
                    };
                    xhr.onload = () => {
                        if (xhr.status < 300) resolve();
                        else reject(new Error(xhr.responseText));
                    };
                    xhr.onerror = () => reject(new Error('Upload failed'));

                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('title', title || file.name);
                    fd.append('subject', subject);
                    fd.append('semester', semester);
                    xhr.send(fd);
                });
                toast.success('Question Paper uploaded!');
            }

            setTitle('');
            setSubject('');
            setFile(null);
            setSemester('I');
            setShow(false);
            setEditingItem(null);
            setProgress(0);
            if (fileRef.current) fileRef.current.value = '';
            load();
        } catch (err) {
            toast.error(editingItem ? 'Update failed' : 'Upload failed');
        } finally {
            setSaving(false);
        }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this paper?')) return;
        try {
            await deleteQuestionPaper(id);
            load();
            toast.success('Paper deleted.');
        } catch {
            toast.error('Failed to delete.');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)', boxSizing: 'border-box' }}>
            <ToastContainer />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(22px, 5vw, 26px)', margin: '0 0 4px' }}>📑 Manage Question Papers</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>{totalItems} paper{totalItems !== 1 ? 's' : ''} found</p>
                </div>
                <button onClick={() => {
                    if (show) { setShow(false); setEditingItem(null); setTitle(''); setSubject(''); setFile(null); }
                    else setShow(true);
                }}
                    style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer', background: show ? 'var(--bg-card-hover)' : 'var(--accent)', color: '#fff', transition: 'background 0.15s' }}>
                    {show ? '✕ Cancel' : '+ Add Question Paper'}
                </button>
            </div>

            {show && (
                <form onSubmit={handleAction} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginTop: 0, marginBottom: '20px', fontSize: '16px' }}>{editingItem ? '✏️ Edit Paper Details' : '📤 Upload Question Paper'}</h3>
                    {!editingItem && (
                        <div onClick={() => fileRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); chooseFile(e.dataTransfer.files?.[0]); }}
                            style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)'}`, borderRadius: '12px', padding: '32px 16px', textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(34,197,94,0.05)' : dragOver ? 'rgba(168,85,247,0.06)' : 'var(--bg-sidebar)', transition: 'all 0.2s', marginBottom: '20px' }}>
                            {file ? (
                                <>
                                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                                    <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>{file.name}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 12px' }}>{fmtSize(file.size)}</p>
                                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--error)', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                                        🗑 Remove
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
                                    <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px', margin: '0 0 6px' }}>Choose a question paper file</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 4px' }}>or drag & drop here</p>
                                </>
                            )}
                            <input ref={fileRef} type="file" accept={ACCEPT} onChange={e => chooseFile(e.target.files?.[0])} style={{ display: 'none' }} />
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div><label style={LBL}>Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="e.g. Mid-term DS 2023" /></div>
                        <div><label style={LBL}>Subject</label><input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="input" placeholder="e.g. Data Structures" /></div>
                        <div><label style={LBL}>Semester</label><select value={semester} onChange={e => setSemester(e.target.value)} className="input">{SEMESTERS.map(s => <option key={s} value={s}>{`Semester ${s}`}</option>)}</select></div>
                    </div>

                    <button type="submit" disabled={saving || (!editingItem && !file)}
                        style={{ padding: '11px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: (saving || (!editingItem && !file)) ? 'not-allowed' : 'pointer', background: (saving || (!editingItem && !file)) ? 'var(--bg-card-hover)' : 'var(--accent)', color: (saving || (!editingItem && !file)) ? 'var(--text-muted)' : '#fff' }}>
                        {saving ? (editingItem ? 'Saving…' : `Uploading ${progress}%…`) : editingItem ? 'Update Paper' : '⬆ Upload Paper'}
                    </button>
                </form>
            )}

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', height: '140px' }} className="animate-pulse" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div style={{ fontSize: '56px', marginBottom: '12px' }}>📖</div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>No question papers found</p>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Upload your first previous paper above.</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px' }}>
                        {items.map(m => (
                            <div key={m.id || m._id} style={{ position: 'relative' }}
                                onMouseEnter={e => { e.currentTarget.querySelectorAll('[data-del]').forEach(b => b.style.opacity = '1'); }}
                                onMouseLeave={e => { e.currentTarget.querySelectorAll('[data-del]').forEach(b => b.style.opacity = '0'); }}>
                                <MaterialCard material={{ ...m, file_url: m.fileUrl || m.file_url }} />
                                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                                    <button data-del onClick={() => handleEdit(m)}
                                        style={{ background: 'rgba(168,85,247,0.9)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}>
                                        Edit
                                    </button>
                                    <button data-del onClick={() => del(m.id || m._id)}
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

export default ManageQuestionPapers;
