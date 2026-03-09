import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/Toast';
import { Plus, Search, Trash2, Users, FileText, ChevronDown, Download, AlertCircle, ExternalLink, Edit, Briefcase, MapPin, Calendar, DollarSign } from 'lucide-react';
import Pagination from '../../components/Common/Pagination';
import { BASE_URL } from '../../services/api';

const ManagePlacements = () => {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const { toast, ToastContainer } = useToast();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [form, setForm] = useState({
        company: '', role: '', package: '', location: '', deadline: '', eligibility: '', description: '', job_link: '', semester: 'All'
    });

    const getLimit = () => {
        if (window.innerWidth < 768) return 5;
        if (window.innerWidth < 1024) return 6;
        return 9;
    };

    const [limit, setLimit] = useState(getLimit());

    const loadDrives = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/placements/?page=${page}&limit=${limit}`);
            const data = await res.json();
            setDrives(data.items || []);
            setTotalPages(data.pages || 1);
            setTotalItems(data.total || 0);
        } catch {
            toast.error('Failed to load drives');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            const newLimit = getLimit();
            if (newLimit !== limit) setLimit(newLimit);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [limit]);

    useEffect(() => { loadDrives(); }, [page, limit]);

    const handleEdit = (drive) => {
        setEditingItem(drive);
        setForm({
            company: drive.company || '',
            role: drive.role || '',
            package: drive.package || '',
            location: drive.location || '',
            deadline: drive.deadline ? drive.deadline.split('T')[0] : '',
            eligibility: drive.eligibility || '',
            description: drive.description || '',
            job_link: drive.job_link || '',
            semester: drive.semester || 'All'
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingItem ? `${BASE_URL}/placements/${editingItem.id || editingItem._id}` : `${BASE_URL}/placements/`;
            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                toast.success(editingItem ? 'Drive updated!' : 'Drive posted!');
                setForm({
                    company: '', role: '', package: '', location: '', deadline: '', eligibility: '', description: '', job_link: '', semester: 'All'
                });
                setShowForm(false);
                setEditingItem(null);
                loadDrives();
            } else {
                const err = await res.json();
                toast.error(err.error || 'Failed to save drive');
            }
        } catch {
            toast.error('Connection error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this drive?')) return;
        try {
            const res = await fetch(`${BASE_URL}/placements/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Drive deleted');
                loadDrives();
            }
        } catch {
            toast.error('Deletion failed');
        }
    };

    const viewApplicants = async (drive) => {
        setSelectedDrive(drive);
        setLoadingApplicants(true);
        try {
            const res = await fetch(`${BASE_URL}/placements/applications/${drive.id || drive._id}`);
            const data = await res.json();
            setApplicants(data);
        } catch {
            toast.error('Failed to load applicants');
        } finally {
            setLoadingApplicants(false);
        }
    };

    const updateStatus = async (appId, newStatus) => {
        try {
            const res = await fetch(`${BASE_URL}/placements/applications/${appId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch {
            toast.error('Failed to update status');
        }
    };

    const exportToCSV = () => {
        if (!applicants.length) return;
        const headers = ['Name', 'Email', 'Status', 'Date Applied'];
        const rows = applicants.map(a => [a.student_name, a.student_email, a.status, a.applied_at]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${selectedDrive.company}_applicants.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isExpired = (deadline) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const filteredDrives = drives.filter(d =>
        d.company.toLowerCase().includes(search.toLowerCase()) ||
        d.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)', position: 'relative', overflowX: 'hidden', boxSizing: 'border-box' }}>
            <ToastContainer />

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Elite Header */}
                <div style={{
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
                    marginBottom: '32px', gap: '20px'
                }}>
                    <div>
                        <h1 style={{
                            color: 'var(--text-primary)', fontSize: 'clamp(24px, 6vw, 32px)',
                            fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.8px'
                        }}>
                            Recruitment <span style={{ color: '#3B82F6' }}>Drives</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px', fontWeight: 600 }}>
                            Manage active placements and candidates • {totalItems} total
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (showForm) { setShowForm(false); setEditingItem(null); setForm({ company: '', role: '', package: '', location: '', deadline: '', eligibility: '', description: '', job_link: '', semester: 'All' }); }
                            else setShowForm(true);
                        }}
                        style={{
                            background: showForm ? 'rgba(239, 68, 68, 0.1)' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                            color: showForm ? '#F87171' : 'white',
                            border: showForm ? '1px solid rgba(239, 68, 68, 0.2)' : 'none',
                            padding: '14px 28px', borderRadius: '16px', fontWeight: 800,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                            fontSize: '14px',
                            boxShadow: showForm ? 'none' : '0 10px 25px -8px rgba(59, 130, 246, 0.6)'
                        }}
                    >
                        {showForm ? '✕ Close Form' : <><Plus size={18} /> New Drive</>}
                    </button>
                </div>

                {/* Search Bar - Elite Design */}
                <div style={{ position: 'relative', marginBottom: '32px' }}>
                    <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#3B82F6' }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search active recruitment drives..."
                        style={{
                            width: '100%', background: 'var(--bg-card)',
                            border: '1px solid var(--border)', borderRadius: '20px',
                            padding: '18px 20px 18px 58px', color: 'white', outline: 'none',
                            fontSize: '15px', fontWeight: 500, backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease', boxSizing: 'border-box'
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--bg-card)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-card)'; }}
                    />
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <div style={{
                        background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
                        border: '1px solid var(--border)', borderRadius: '28px',
                        padding: isMobile ? '24px' : '40px', marginBottom: '40px',
                        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)',
                        animation: 'slideDown 0.6s cubic-bezier(0.19, 1, 0.22, 1)'
                    }}>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800, marginBottom: '28px', marginTop: 0 }}>
                            {editingItem ? `✏️ Edit Drive: ${editingItem.company}` : '🚀 Create New Drive'}
                        </h2>
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
                            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Company</label>
                                <input required className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Google / Microsoft" style={{ height: '52px', borderRadius: '16px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Role</label>
                                <input required className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Software Engineer" style={{ height: '52px', borderRadius: '16px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CTC / Package</label>
                                <input className="input" value={form.package} onChange={e => setForm({ ...form, package: e.target.value })} placeholder="12.5 LPA" style={{ height: '52px', borderRadius: '16px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Location</label>
                                <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Bangalore / Remote" style={{ height: '52px', borderRadius: '16px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deadline</label>
                                <input type="date" className="input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} style={{ height: '52px', borderRadius: '16px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Eligible Semester</label>
                                <select className="input" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} style={{ height: '52px', borderRadius: '16px' }}>
                                    <option value="All">All Semesters</option>
                                    <option value="Semester I">Semester I</option>
                                    <option value="Semester II">Semester II</option>
                                    <option value="Semester III">Semester III</option>
                                    <option value="Semester IV">Semester IV</option>
                                    <option value="Semester V">Semester V</option>
                                    <option value="Semester VI">Semester VI</option>
                                    <option value="Semester VII">Semester VII</option>
                                    <option value="Semester VIII">Semester VIII</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 3' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Application Link (Direct URL)</label>
                                <input required className="input" type="url" value={form.job_link} onChange={e => setForm({ ...form, job_link: e.target.value })} placeholder="https://careers.google.com/jobs/..." style={{ height: '52px', borderRadius: '16px' }} />
                            </div>
                            <div style={{ gridColumn: isMobile ? 'span 1' : 'span 3' }}>
                                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '10px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Eligibility & Description</label>
                                <textarea rows={4} className="input" style={{ resize: 'none', borderRadius: '20px', padding: '20px' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="C.G.P.A > 8.0, 2024 Batch graduates..." />
                            </div>
                            <button type="submit" disabled={saving} style={{
                                gridColumn: isMobile ? 'span 1' : 'span 3',
                                background: 'linear-gradient(135deg, #3B82F6, #1E4ED8)',
                                color: 'white', border: 'none', padding: '18px', borderRadius: '18px',
                                fontWeight: 800, cursor: 'pointer', fontSize: '16px',
                                boxShadow: '0 15px 30px -10px rgba(59, 130, 246, 0.4)',
                                transition: 'all 0.3s ease', marginTop: '12px'
                            }}>
                                {saving ? 'Saving...' : editingItem ? 'Save Updates' : 'Publish Opportunity →'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Drives Grid */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: '110px', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border)' }} className="skeleton-glow" />)}
                    </div>
                ) : filteredDrives.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>No drives match your search</h3>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Try adjusting your keywords or clearing the filter.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {filteredDrives.map((d, idx) => (
                            <div key={d.id || d._id}
                                style={{
                                    background: 'var(--bg-card)',
                                    padding: isMobile ? '20px' : '28px', borderRadius: '28px',
                                    border: '1px solid var(--border)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    flexDirection: isMobile ? 'column' : 'row', gap: '24px',
                                    transition: 'all 0.45s cubic-bezier(0.19, 1, 0.22, 1)',
                                    backdropFilter: 'blur(16px)',
                                    animation: `fadeInUp 0.6s ease-out ${idx * 0.08}s both`,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0,0,0,0.5)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'var(--bg-card)';
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
                                    {/* Company Icon Container */}
                                    <div style={{
                                        minWidth: '60px', minHeight: '60px', borderRadius: '18px',
                                        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#60A5FA', fontSize: '24px', fontWeight: 900,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.05)',
                                        textShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
                                    }}>
                                        {d.company ? d.company[0].toUpperCase() : '?'}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                            <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '20px', fontWeight: 850, letterSpacing: '-0.3px' }}>{d.company}</h3>
                                            {isExpired(d.deadline) ? (
                                                <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.12)', color: '#EF4444', padding: '4px 12px', borderRadius: '10px', fontWeight: 900, border: '1px solid rgba(239,68,68,0.1)' }}>EXPIRED</span>
                                            ) : (
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 10px #22C55E' }} />
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FileText size={15} color="#3B82F6" /> <span style={{ color: 'var(--text-muted)' }}>{d.role}</span>
                                            </span>
                                            <span style={{ color: '#475569' }}>•</span>
                                            <span style={{ color: '#3B82F6', fontSize: '14px', fontWeight: 800, letterSpacing: '0.3px' }}>{d.package}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Elite Layout */}
                                <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'flex-end' : 'center' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); viewApplicants(d); }}
                                        style={{
                                            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: 'white',
                                            border: 'none', padding: '12px 24px', borderRadius: '16px',
                                            fontWeight: 800, cursor: 'pointer', fontSize: '14px',
                                            transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px',
                                            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
                                            flex: isMobile ? 1 : 'none', justifyContent: 'center'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(59, 130, 246, 0.6)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(59, 130, 246, 0.4)'; e.currentTarget.style.transform = 'none' }}
                                    >
                                        View Applicants <span style={{ fontSize: '18px' }}>→</span>
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(d); }}
                                        title="Edit Drive"
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.6)', color: '#94A3B8',
                                            border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '16px',
                                            cursor: 'pointer', transition: 'all 0.2s ease',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#3B82F6'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'; e.currentTarget.style.background = 'rgba(59,130,246,0.05)' }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)' }}
                                    >
                                        <Edit size={20} />
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(d.id || d._id); }}
                                        title="Delete Drive"
                                        style={{
                                            background: 'rgba(15, 23, 42, 0.6)', color: '#64748B',
                                            border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '16px',
                                            cursor: 'pointer', transition: 'all 0.2s ease',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)' }}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: '12px' }}>
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    </div>
                )}
            </div>

            {/* Elite Drawer for Applicants */}
            {selectedDrive && (
                <>
                    <div onClick={() => setSelectedDrive(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', zIndex: 1000, animation: 'fadeIn 0.4s ease' }} />
                    <div style={{
                        position: 'fixed', top: isMobile ? '20%' : 0, right: 0, bottom: 0,
                        width: isMobile ? '100%' : '520px',
                        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
                        zIndex: 1001, padding: '32px', display: 'flex', flexDirection: 'column',
                        boxShadow: '-30px 0 60px rgba(0,0,0,0.2)', borderTopLeftRadius: isMobile ? '32px' : 0,
                        animation: 'slideInRight 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '24px', margin: 0, letterSpacing: '-0.5px' }}>Candidate Applications</h2>
                                <p style={{ color: '#3B82F6', fontSize: '13px', fontWeight: 800, marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {selectedDrive.company} • {selectedDrive.role}
                                </p>
                            </div>
                            <button onClick={() => setSelectedDrive(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', padding: '12px', borderRadius: '16px', cursor: 'pointer' }}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                            <span style={{ color: '#22C55E', fontWeight: 800, fontSize: '14px' }}>{applicants.length} Aspirants Applied</span>
                            <button onClick={exportToCSV} style={{
                                background: '#22C55E', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px',
                                fontSize: '12px', fontWeight: 850, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <Download size={15} /> EXPORT CSV
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loadingApplicants ? (
                                <div style={{ textAlign: 'center', padding: '80px 0' }}><div className="skeleton-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto' }} /><p style={{ color: '#475569', marginTop: '16px', fontSize: '14px' }}>Fetching applicants...</p></div>
                            ) : applicants.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.6 }}><AlertCircle size={40} style={{ color: '#64748B', margin: '0 auto 16px' }} /><p style={{ color: '#64748B', fontWeight: 600 }}>No applications recorded yet.</p></div>
                            ) : (
                                applicants.map((a, idx) => (
                                    <div key={a.id || a._id} style={{
                                        background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '24px',
                                        border: '1px solid rgba(255,255,255,0.04)', animation: `fadeOutUp 0.4s ease-out ${idx * 0.05}s reverse both`
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ color: 'white', fontWeight: 850, fontSize: '16px' }}>{a.student_name}</div>
                                                <div style={{ color: '#64748B', fontSize: '13px', marginTop: '3px', fontWeight: 500 }}>{a.student_email}</div>
                                            </div>
                                            <div style={{ color: '#475569', fontSize: '11px', fontWeight: 900 }}>{new Date(a.applied_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />
                                        <label style={{ display: 'block', fontSize: '10px', color: '#475569', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Recruitment Status</label>
                                        <select
                                            value={a.status}
                                            onChange={(e) => updateStatus(a.id || a._id, e.target.value)}
                                            style={{
                                                width: '100%', background: '#020617',
                                                color: a.status === 'Hired' ? '#22C55E' : a.status === 'Rejected' ? '#EF4444' : a.status === 'Shortlisted' ? '#F59E0B' : '#3B82F6',
                                                border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: '14px', fontSize: '14px', fontWeight: 800, outline: 'none', cursor: 'pointer'
                                            }}
                                        >
                                            <option value="Applied">📄 Applied</option>
                                            <option value="Shortlisted">⭐️ Shortlisted</option>
                                            <option value="Hired">🎉 Hired</option>
                                            <option value="Rejected">✖️ Rejected</option>
                                        </select>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .skeleton-glow { position: relative; overflow: hidden; background: rgba(255,255,255,0.02) !important; }
                .skeleton-glow::after { content: ""; position: absolute; top: 0; right: 0; bottom: 0; left: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); animation: skeleton-wave 1.5s infinite; }
                @keyframes skeleton-wave { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
                input.input, select.input, textarea.input { box-sizing: border-box; }
            `}</style>
        </div>
    );
};

export default ManagePlacements;
