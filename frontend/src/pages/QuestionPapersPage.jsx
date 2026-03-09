import React, { useEffect, useState } from 'react';
import MaterialCard from '../components/Material/MaterialCard';
import { useAuth } from '../context/AuthContext';
import { getQuestionPapers } from '../services/questionPaperService';
import Pagination from '../components/Common/Pagination';
import { FileStack, Globe, LayoutGrid, Search, Loader2, ChevronRight, FileText } from 'lucide-react';

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

const QuestionPapersPage = () => {
    const { user } = useAuth();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('foryou'); // 'foryou' or 'browse'
    const [selectedSemester, setSelectedSemester] = useState(user?.semester || 'I');
    const [query, setQuery] = useState('');

    const load = () => {
        setLoading(true);
        const sem = activeTab === 'foryou' ? (user?.semester || 'I') : selectedSemester;

        getQuestionPapers(page, 10, sem)
            .then(res => {
                setPapers(res.items || []);
                setTotalPages(res.pages || 1);
            })
            .catch(err => console.error("Failed to load question papers:", err))
            .finally(() => setLoading(false));
    };

    useEffect(load, [page, activeTab, selectedSemester]);

    const filtered = papers.filter(p =>
        p.title?.toLowerCase().includes(query.toLowerCase()) ||
        p.subject?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)', boxSizing: 'border-box' }}>
            {/* ── Header ── */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                        <FileStack size={28} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Question Papers</h1>
                </div>
                <p className="text-[var(--text-muted)] text-sm font-medium">Review previous year exam papers to excel in your upcoming assessments.</p>
            </div>

            {/* ── Tabs Selector ── */}
            <div className="flex items-center gap-2 mb-8 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border)] w-fit shadow-lg">
                <button
                    onClick={() => { setActiveTab('foryou'); setPage(1); }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'foryou' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-[var(--text-muted)] hover:text-white'}`}
                >
                    <LayoutGrid size={16} />
                    My Semester ({user?.semester || 'I'})
                </button>
                <button
                    onClick={() => { setActiveTab('browse'); setPage(1); }}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'browse' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-[var(--text-muted)] hover:text-white'}`}
                >
                    <Globe size={16} />
                    Browse All
                </button>
            </div>

            {/* ── Semester Filter (for Browse All) ── */}
            {activeTab === 'browse' && (
                <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    {SEMESTERS.map(s => (
                        <button
                            key={s}
                            onClick={() => { setSelectedSemester(s); setPage(1); }}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border transition-all ${selectedSemester === s ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-md shadow-amber-500/5' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:border-slate-700'}`}
                        >
                            Sem {s}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Search Bar ── */}
            <div className="relative mb-8 group max-w-2xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by paper title or subject..."
                    className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] pl-12 pr-6 py-3.5 rounded-2xl focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-600 font-bold text-sm"
                />
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border)] animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-20 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full" />
                    <div className="text-6xl mb-6 grayscale opacity-30">📄</div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">No papers found</h2>
                    <p className="text-[var(--text-muted)] max-w-sm mx-auto font-medium leading-relaxed">
                        We don't have any previous question papers for Semester {activeTab === 'foryou' ? user?.semester : selectedSemester} in the archives yet.
                    </p>
                    {activeTab === 'foryou' && (
                        <button
                            onClick={() => { setActiveTab('browse'); setPage(1); }}
                            className="mt-8 px-8 py-4 bg-amber-600/10 border border-amber-500/20 text-amber-500 font-black rounded-2xl hover:bg-amber-600 hover:text-white transition-all flex items-center gap-2 mx-auto"
                        >
                            Explore All Years
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(paper => (
                            <MaterialCard key={paper.id || paper._id} material={{ ...paper, file_url: paper.fileUrl || paper.file_url }} />
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

export default QuestionPapersPage;
