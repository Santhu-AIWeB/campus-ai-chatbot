import React, { useEffect, useState } from 'react';
import { getMaterials } from '../services/materialService';
import { useAuth } from '../context/AuthContext';
import MaterialCard from '../components/Material/MaterialCard';
import Pagination from '../components/Common/Pagination';
import { Search, Filter, Library, BookOpen } from 'lucide-react';

const TYPES = ['All', 'PDF', 'PPT', 'Video', 'Notes'];

const MaterialsPage = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [query, setQuery] = useState('');
    const [type, setType] = useState('All');

    const getLimit = () => {
        if (window.innerWidth < 768) return 5;
        if (window.innerWidth < 1024) return 6;
        return 9;
    };

    const [limit, setLimit] = useState(getLimit());
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    const loadData = async (pageNum) => {
        setLoading(true);
        try {
            const semesterFilter = user?.role === 'student' ? user.semester : '';
            const res = await getMaterials(pageNum, limit, semesterFilter, '', 'Question Paper');
            setMaterials(res.items || []);
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
            setIsMobile(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [limit]);

    useEffect(() => {
        loadData(page);
    }, [page, limit]);

    const filtered = materials.filter(m => {
        const matchType = type === 'All' || m.type === type;
        const matchQuery = m.title?.toLowerCase().includes(query.toLowerCase()) ||
            m.subject?.toLowerCase().includes(query.toLowerCase());
        return matchType && matchQuery;
    });

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)' }}>
            {/* Header Area */}
            <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Library size={28} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Study Materials</h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium max-w-md">
                        Access high-quality study resources including lecture notes, presentations, and supplementary videos.
                    </p>
                </div>

                {user?.role === 'student' && (
                    <button
                        onClick={() => window.location.href = '/contribute'}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 w-full md:w-auto"
                    >
                        <Library size={20} strokeWidth={2.5} />
                        Contribute Notes
                    </button>
                )}
            </div>

            {/* Search Bar Row */}
            <div className="mb-8">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search for materials, subjects, or keywords..."
                        className="w-full bg-[#0a0f1a] border border-slate-800/50 text-[var(--text-primary)] pl-14 pr-6 py-3.5 rounded-xl focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]/50 transition-all placeholder:text-slate-600 outline-none"
                    />
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide px-1 -mx-1">
                <div className="flex items-center gap-2 pr-4 border-r border-slate-800 text-slate-500 flex-shrink-0">
                    <Filter size={14} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Filter</span>
                </div>
                {TYPES.map(t => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`text-xs font-black px-6 py-3 rounded-2xl transition-all whitespace-nowrap border-2 ${type === t
                            ? 'bg-blue-500 text-white border-blue-400 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)]'
                            : 'bg-[var(--bg-surface)] text-slate-500 border-transparent hover:border-slate-700 hover:text-slate-300'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {
                loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="rounded-2xl p-6 animate-pulse border border-slate-800/50" style={{ background: '#111827' }}>
                                <div className="w-14 h-14 rounded-2xl mb-5" style={{ background: '#1e293b' }} />
                                <div className="h-4 rounded-md mb-3" style={{ background: '#1e293b', width: '80%' }} />
                                <div className="h-3 rounded-md" style={{ background: '#1e293b', width: '40%' }} />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                        <div className="p-6 rounded-full bg-slate-800/30 text-slate-600 mb-6">
                            <BookOpen size={48} />
                        </div>
                        <p className="text-xl font-bold text-white mb-2">No materials found</p>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                            Try another page or search term.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(m => <MaterialCard key={m._id || m.id} material={m} />)}
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )
            }
        </div >
    );
};
export default MaterialsPage;
