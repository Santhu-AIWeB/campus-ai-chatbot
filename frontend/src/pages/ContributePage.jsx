import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const ContributePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState(user?.semester || '');
    const [type, setType] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            if (!title) setTitle(selected.name.split('.')[0]);

            // Auto-detect type
            const ext = selected.name.split('.').pop().toLowerCase();
            if (ext === 'pdf') setType('PDF');
            else if (['ppt', 'pptx'].includes(ext)) setType('PPT');
            else if (['mp4', 'mkv', 'avi'].includes(ext)) setType('Video');
            else setType('Notes');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            addToast('Please select a file first', 'error');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('semester', semester);
        formData.append('type', type);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/materials/student-upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                setSuccess(true);
                addToast('Material submitted for review!', 'success');
                setTimeout(() => navigate('/materials'), 2000);
            } else {
                const data = await res.json();
                addToast(data.error || 'Failed to upload material', 'error');
            }
        } catch (err) {
            addToast('Network error, please try again', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/10">
                    <CheckCircle size={48} strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">Well Done!</h2>
                <p className="text-[var(--text-muted)] max-w-sm mb-8 leading-relaxed">
                    Your contribution has been submitted. Our admins will review and publish it soon. Thank you for helping the community!
                </p>
                <button
                    onClick={() => navigate('/materials')}
                    className="px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-green-500/20"
                >
                    Back to Materials
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10">
            <button
                onClick={() => navigate('/materials')}
                className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors font-bold group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Library
            </button>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Info Text */}
                <div className="md:w-1/3">
                    <div className="p-3 w-fit rounded-2xl bg-blue-500/10 text-blue-400 mb-6">
                        <Upload size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tight leading-tight">Share Your Knowledge</h1>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 font-medium">
                        Your notes could be the key to someone else's success. Contribute PDFs, PPTs, or videos to help your fellow students.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
                            <div className="w-6 h-6 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-blue-400">1</div>
                            Pick a clean, high-quality file
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
                            <div className="w-6 h-6 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-blue-400">2</div>
                            Tag it with the correct semester
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
                            <div className="w-6 h-6 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-blue-400">3</div>
                            WaitFor admin approval
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* File Dropzone area */}
                        <div
                            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group ${file ? 'border-green-500/30 bg-green-500/5' : 'border-[var(--border)] hover:border-blue-500/30 hover:bg-blue-500/5'}`}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input id="file-input" type="file" className="hidden" onChange={handleFileChange} />

                            {file ? (
                                <>
                                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center mb-4">
                                        <FileText size={32} />
                                    </div>
                                    <p className="text-[var(--text-primary)] font-extrabold text-sm mb-1">{file.name}</p>
                                    <p className="text-xs text-green-400 font-bold uppercase tracking-widest">Selected</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={32} />
                                    </div>
                                    <p className="text-[var(--text-primary)] font-bold mb-1">Select Study Material</p>
                                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">PDF, PPT, or Video up to 100MB</p>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">Resource Title</label>
                                <input
                                    type="text" required placeholder="e.g. Unit 3 Full Notes"
                                    value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm text-[var(--text-primary)] font-bold transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">Subject Name</label>
                                <input
                                    type="text" required placeholder="e.g. Operating Systems"
                                    value={subject} onChange={e => setSubject(e.target.value)}
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm text-[var(--text-primary)] font-bold transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">Applies to Semester</label>
                                <select
                                    value={semester} onChange={e => setSemester(e.target.value)} required
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm text-[var(--text-primary)] font-bold transition-all"
                                >
                                    <option value="">Select Semester</option>
                                    <option value="I">Semester I</option>
                                    <option value="II">Semester II</option>
                                    <option value="III">Semester III</option>
                                    <option value="IV">Semester IV</option>
                                    <option value="V">Semester V</option>
                                    <option value="VI">Semester VI</option>
                                    <option value="VII">Semester VII</option>
                                    <option value="VIII">Semester VIII</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-2">Content Type</label>
                                <select
                                    value={type} onChange={e => setType(e.target.value)} required
                                    className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm text-[var(--text-primary)] font-bold transition-all"
                                >
                                    <option value="">Select Type</option>
                                    <option value="PDF">PDF Document</option>
                                    <option value="PPT">Presentation (PPT)</option>
                                    <option value="Video">Video Tutorial</option>
                                    <option value="Notes">Digital Notes</option>
                                </select>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" size={20} /> Uploading Knowledge...</>
                            ) : (
                                <><Upload size={20} /> Publish Contribution</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContributePage;
