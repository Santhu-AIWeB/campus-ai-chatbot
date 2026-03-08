import React, { useState, useEffect } from 'react';
import PlacementCard from '../components/Placement/PlacementCard';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin } from 'lucide-react';
import Pagination from '../components/Common/Pagination';

const PlacementsPage = () => {
    const { user } = useAuth();
    const [placements, setPlacements] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filterLoc, setFilterLoc] = useState('All');

    const getLimit = () => {
        if (window.innerWidth < 768) return 5;
        if (window.innerWidth < 1024) return 6;
        return 9;
    };

    const [limit, setLimit] = useState(getLimit());

    const loadData = async (pageNum) => {
        setLoading(true);
        try {
            const rp = await fetch(`/api/placements/?page=${pageNum}&limit=${limit}`);
            const ra = await fetch('/api/placements/applications');
            const pd = await rp.json();
            const ad = await ra.json();
            setPlacements(pd.items || []);
            setTotalPages(pd.pages || 1);
            setPage(pd.page || 1);
            setApplications(ad);
        } catch (err) {
            console.error("Load failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(page);
    }, [page, limit]);

    const handleApply = async (p_id) => {
        try {
            const res = await fetch('/api/placements/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    placement_id: p_id,
                    student_name: user?.name,
                    student_email: user?.email
                })
            });
            if (res.ok) {
                const newApp = await res.json();
                setApplications(p => [...p, newApp]);
            } else {
                const err = await res.json();
                alert(err.error || "Application failed");
            }
        } catch (err) {
            alert("Connection error");
        }
    };

    const getStatus = (p_id) => {
        const app = applications.find(a => a.placement_id === p_id && a.student_email === user?.email);
        return app ? app.status : null;
    };

    const filtered = placements.filter(p => {
        const matchesSearch = p.company.toLowerCase().includes(search.toLowerCase()) ||
            p.role.toLowerCase().includes(search.toLowerCase());
        const matchesLoc = filterLoc === 'All' || p.location === filterLoc;
        return matchesSearch && matchesLoc;
    });

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            const newLimit = getLimit();
            if (newLimit !== limit) setLimit(newLimit);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [limit]);

    const locations = ['All', ...new Set(placements.map(p => p.location).filter(Boolean))];

    return (
        <div style={{ minHeight: '100%', padding: isMobile ? '72px 16px 40px' : '40px 24px', background: 'var(--bg-main)' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* Mobile Top Bar Extra Controls */}
                {isMobile && (
                    <div style={{ position: 'fixed', top: '10px', right: '12px', zIndex: 60, display: 'flex', gap: '10px' }}>
                        <div style={{
                            width: '38px', height: '38px', borderRadius: '10px',
                            background: '#3B82F6', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontWeight: 900,
                            boxShadow: '0 4px 12px rgba(59,130,246,0.3)', fontSize: '16px'
                        }}>{user?.name?.[0].toUpperCase() || 'S'}</div>
                    </div>
                )}

                {/* Header Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: isMobile ? '32px' : '48px' }}>
                    {!isMobile && (
                        <div>
                            <h1 style={{ color: 'var(--text-primary)', fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
                                Placement <span style={{ color: 'var(--accent)' }}>Portal</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', lineHeight: 1.6 }}>
                                Discover exclusive career opportunities, track your applications, and launch your professional journey with top-tier companies.
                            </p>
                        </div>
                    )}

                    {/* Filter Bar */}
                    <div style={{
                        display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px',
                        background: 'var(--bg-card)', padding: '12px',
                        borderRadius: '20px', border: '1px solid var(--border)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ flex: 1, minWidth: isMobile ? '100%' : '240px', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by company or role..."
                                style={{
                                    width: '100%', height: '48px', background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)', borderRadius: '14px',
                                    paddingLeft: '48px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                <select
                                    value={filterLoc} onChange={e => setFilterLoc(e.target.value)}
                                    style={{
                                        height: '48px', width: '100%', minWidth: isMobile ? '0' : '160px', background: 'var(--bg-surface)',
                                        border: '1px solid var(--border)', borderRadius: '14px',
                                        paddingLeft: '40px', paddingRight: '12px', color: 'var(--text-primary)',
                                        fontSize: '14px', outline: 'none', appearance: 'none'
                                    }}
                                >
                                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ height: '300px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', opacity: 0.5 }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748B', background: 'rgba(15, 23, 42, 0.2)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '18px' }}>No matching placement drives found.</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            {filtered.map(p => (
                                <PlacementCard
                                    key={p.id}
                                    placement={p}
                                    onApply={handleApply}
                                    isApplied={!!getStatus(p.id)}
                                    applicationStatus={getStatus(p.id)}
                                    studentSemester={user?.semester}
                                />
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

            {/* Mobile Float Message Button */}
            {isMobile && (
                <div style={{
                    position: 'fixed', bottom: '24px', right: '20px', zIndex: 100,
                    width: '56px', height: '56px', borderRadius: '28px',
                    background: '#3B82F6', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'white',
                    boxShadow: '0 8px 32px rgba(59,130,246,0.5)', cursor: 'pointer'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z" />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default PlacementsPage;
