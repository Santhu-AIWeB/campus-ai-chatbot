import React, { useEffect, useState } from 'react';
import MaterialCard from '../components/Material/MaterialCard';
import { useAuth } from '../context/AuthContext';
import { getQuestionPapers } from '../services/questionPaperService';
import Pagination from '../components/Common/Pagination';

const QuestionPapersPage = () => {
    const { user } = useAuth();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const load = () => {
        setLoading(true);
        // We use the same service but we will filter on the frontend or backend
        // Since getMaterials doesn't currently support 'type' filter in params, 
        // we might need to update the service or just filter all for now if the count is low.
        // However, a better approach is to update the backend/service if possible.
        // For now, let's assume we can pass a type to getMaterials if we update it.
        getQuestionPapers(page, 10, user?.semester)
            .then(res => {
                setPapers(res.items || []);
                setTotalPages(res.pages || 1);
                setTotalItems(res.total || 0);
            })
            .catch(err => console.error("Failed to load question papers:", err))
            .finally(() => setLoading(false));
    };

    useEffect(load, [page, user?.semester]);

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full" style={{ background: 'var(--bg-main)', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(24px, 5vw, 32px)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                    📑 Previous Question Papers
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0 }}>
                    Access archived exam papers for <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Semester {user?.semester || '?'}</span>
                </p>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ height: '160px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }} className="animate-pulse" />
                    ))}
                </div>
            ) : papers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📂</div>
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>No papers found</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                        We don't have any previous question papers uploaded for Semester {user?.semester} yet. Check back later!
                    </p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {papers.map(paper => (
                            <MaterialCard key={paper.id || paper._id} material={{ ...paper, file_url: paper.fileUrl || paper.file_url }} />
                        ))}
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />
        </div>
    );
};

export default QuestionPapersPage;
