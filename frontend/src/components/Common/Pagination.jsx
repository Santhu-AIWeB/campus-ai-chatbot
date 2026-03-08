import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const delta = 2; // Number of pages to show around current page

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(
                    <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        style={{
                            minWidth: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: currentPage === i ? 'var(--accent)' : 'var(--border)',
                            background: currentPage === i ? 'var(--bg-icon)' : 'var(--bg-card)',
                            color: currentPage === i ? 'var(--accent)' : 'var(--text-muted)',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={e => {
                            if (currentPage !== i) e.currentTarget.style.borderColor = 'var(--border-icon)';
                        }}
                        onMouseLeave={e => {
                            if (currentPage !== i) e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                    >
                        {i}
                    </button>
                );
            } else if (
                (i === currentPage - delta - 1) ||
                (i === currentPage + delta + 1)
            ) {
                pages.push(<span key={i} style={{ color: 'var(--text-muted)', padding: '0 8px' }}>...</span>);
            }
        }
        return pages;
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '48px',
            padding: '20px'
        }}>
            <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--accent)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    transition: '0.2s'
                }}
            >
                <ChevronLeft size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {renderPageNumbers()}
            </div>

            <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--accent)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    transition: '0.2s'
                }}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
