import React, { useEffect, useState } from 'react';
import { getMaterials } from '../services/materialService';
import { useAuth } from '../context/AuthContext';
import MaterialCard from '../components/Material/MaterialCard';
import Pagination from '../components/Common/Pagination';
import { Search, Filter, Library, BookOpen, Globe, LayoutGrid, Sparkles, ChevronRight } from 'lucide-react';

const TYPES = ['All', 'PDF', 'PPT', 'Video', 'Notes'];
const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const MaterialsPage = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [query, setQuery] = useState('');
    const [type, setType] = useState('All');
    const [activeTab, setActiveTab] = useState('foryou'); // 'foryou' or 'browse'
    const [selectedSemester, setSelectedSemester] = useState(user?.semester || 'I');

    const loadData = async () => {
        setLoading(true);
        try {
            // Determine which semester to fetch
            const sem = activeTab === 'foryou' ? (user?.semester || 'I') : selectedSemester;

            // Fetch materials (exclude Question Papers)
            const res = await getMaterials(page, 9, sem, '', 'Question Paper');
            setMaterials(res.items || []);
            setTotalPages(res.pages || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, activeTab, selectedSemester]);

    const filtered = materials.filter(m => {
        const matchType = type === 'All' || m.type === type;
        const matchQuery = m.title?.toLowerCase().includes(query.toLowerCase()) ||
            m.subject?.toLowerCase().includes(query.toLowerCase());
        return matchType && matchQuery;
    });

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)' }}>
            {/* ── Header Area ── */}
            <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                                <BookOpen size={28} strokeWidth={2.5} />
                            </div>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Academic Library</h1>
                        </div>
                        <p className="text-[var(--text-muted)] text-sm font-medium">Explore curated study resources for your semester and beyond.</p>
                    </div>

                    {user?.role === 'student' && (
                        <button
                            onClick={() => window.location.href = '/contribute'}
                            className="group flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                        >
                            <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                            Contribute Notes
                        </button>
                    )}
                </div>
            </div>

            {/* ── Tabs Selector ── */}
            <div className="flex items-center gap-2 mb-8 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border)] w-fit">
                <button
                    onClick={() => { setActiveTab('foryou'); setPage(1); }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'foryou' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--text-muted)] hover:text-white'}`}
                >
                    <LayoutGrid size={16} />
                    Personalized (Sem {user?.semester || 'I'})
                </button>
                <button
                    onClick={() => { setActiveTab('browse'); setPage(1); }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'browse' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--text-muted)] hover:text-white'}`}
                >
                    <Globe size={16} />
                    Explore All
                </button>
            </div>

            {/* ── Browse All Semester Selector ── */}
            {activeTab === 'browse' && (
                <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {SEMESTERS.map(s => (
                        <button
                            key={s}
                            onClick={() => { setSelectedSemester(s); setPage(1); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${selectedSemester === s ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:border-slate-700'}`}
                        >
                            Sem {s}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Search & Filter Row ── */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search by title or subject..."
                        className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] pl-12 pr-6 py-3.5 rounded-2xl focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 font-bold text-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {TYPES.map(t => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap ${type === t ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content Grid ── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border)] animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-20 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full" />
                    <div className="text-6xl mb-6 grayscale opacity-50">📂</div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">No resources found</h2>
                    <p className="text-[var(--text-muted)] max-w-sm mx-auto font-medium leading-relaxed">
                        We don't have any {type !== 'All' ? type : 'study'} materials uploaded for Semester {activeTab === 'foryou' ? user?.semester : selectedSemester} yet.
                    </p>
                    {activeTab === 'foryou' && (
                        <button
                            onClick={() => { setActiveTab('browse'); setPage(1); }}
                            className="mt-8 px-8 py-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 mx-auto"
                        >
                            Explore Other Semesters
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(material => (
                            <MaterialCard key={material.id || material._id} material={material} />
                        ))}
                    </div>

                    <div className="mt-12">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default MaterialsPage;
