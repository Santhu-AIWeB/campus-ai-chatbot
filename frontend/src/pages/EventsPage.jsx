import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import EventCard from '../components/Event/EventCard';
import Pagination from '../components/Common/Pagination';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
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
            const res = await getEvents(pageNum, limit);
            setEvents(res.items || []);
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

    // Local filtering for currently loaded page (simple approach) or 
    // we could add server-side search later. For now, local is fine for UX.
    const filtered = events.filter(e =>
        e.title?.toLowerCase().includes(query.toLowerCase()) ||
        e.location?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)' }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Campus Events</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Discover and register for upcoming events</p>
                </div>
                <input
                    type="text" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="🔍 Search events…"
                    className="input sm:w-60"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: '#1F2937' }}>
                            <div className="h-36" style={{ background: '#374151' }} />
                            <div className="p-4 space-y-2">
                                <div className="h-4 rounded" style={{ background: '#374151' }} />
                                <div className="h-3 w-2/3 rounded" style={{ background: '#374151' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-3">📅</div>
                    <p className="font-semibold text-[var(--text-primary)]">No events found</p>
                    <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Try a different search term or page</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(e => <EventCard key={e._id || e.id} event={e} />)}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                    />
                </>
            )}
        </div>
    );
};
export default EventsPage;
