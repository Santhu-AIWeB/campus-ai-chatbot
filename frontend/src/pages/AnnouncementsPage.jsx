import React, { useEffect, useState } from 'react';
import { getAnnouncements } from '../services/announcementService';
import AnnouncementCard from '../components/Announcement/AnnouncementCard';
import Pagination from '../components/Common/Pagination';

const AnnouncementsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [query, setQuery] = useState('');

    const getLimit = () => {
        if (window.innerWidth < 768) return 5;
        if (window.innerWidth < 1024) return 6;
        return 9;
    };

    const [limit, setLimit] = useState(getLimit());

    const loadData = async (pageNum) => {
        setLoading(true);
        try {
            const res = await getAnnouncements(pageNum, limit);
            setItems(res.items || []);
            setTotalPages(res.pages || 1);
            setPage(res.page || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const newLimit = getLimit();
            if (newLimit !== limit) setLimit(newLimit);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [limit]);

    useEffect(() => {
        loadData(page);
    }, [page, limit]);

    const filtered = items.filter(a =>
        a.title?.toLowerCase().includes(query.toLowerCase()) ||
        a.content?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Announcements</h1>
                    <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Latest updates from the campus</p>
                </div>
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="🔍 Search announcements…" className="input sm:w-64" />
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#1F2937' }}>
                            <div className="h-[3px]" style={{ background: '#374151' }} />
                            <div className="p-4 flex gap-3">
                                <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: '#374151' }} />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 rounded" style={{ background: '#374151' }} />
                                    <div className="h-3 w-1/3 rounded" style={{ background: '#374151' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-3">📢</div>
                    <p className="font-semibold text-white">No announcements found</p>
                    <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Check another page or search</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {filtered.map(a => <AnnouncementCard key={a._id || a.id} announcement={a} />)}
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
export default AnnouncementsPage;
