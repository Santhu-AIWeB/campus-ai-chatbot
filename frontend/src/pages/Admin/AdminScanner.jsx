import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Scan, CheckCircle, XCircle, Loader2, ArrowLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { apiFetch } from '../../services/api';

const AdminScanner = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [scanResult, setScanResult] = useState(null);
    const [processing, setProcessing] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: { width: 250, height: 250 },
            fps: 10,
        });

        scanner.render(onScanSuccess, onScanError);

        function onScanError(err) {
            // Silently ignore scan errors (they happen every frame if no QR is found)
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, []);

    const onScanSuccess = async (decodedText) => {
        if (processing) return;

        // Basic validation: MongoDB IDs are 24 chars
        if (decodedText.length !== 24) {
            addToast('Invalid QR Code format', 'error');
            return;
        }

        setProcessing(true);
        setScanResult({ status: 'processing', text: decodedText });

        try {
            const data = await apiFetch(`/registrations/${decodedText}/attend`, {
                method: 'PUT'
            });

            setScanResult({ status: 'success', message: 'Attendance Marked!' });
            addToast('Attendance marked successfully', 'success');
        } catch (err) {
            setScanResult({
                status: 'error',
                message: err.message.includes('Unexpected token') ? 'Data Sync Error' : (err.message || 'Network Error')
            });
            console.error("Scan Error:", err);
        } finally {
            setProcessing(false);
            // Reset scan result after 3 seconds to allow next scan
            setTimeout(() => setScanResult(null), 3000);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-screen bg-[var(--bg-main)]">
            <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors font-bold group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Admin
            </button>

            <div className="max-w-xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-3xl bg-blue-500/10 text-blue-400 mb-4 shadow-xl shadow-blue-500/5">
                        <Scan size={40} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2">Attendence Scanner</h1>
                    <p className="text-[var(--text-muted)] font-medium">Point the camera at a student's digital ticket</p>
                </div>

                <div className="relative group">
                    {/* Decorative Scanner border */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

                    <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div id="reader" className="w-full"></div>

                        {/* Overlay when processing or showing result */}
                        {scanResult && (
                            <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300 z-20 ${scanResult.status === 'success' ? 'bg-green-500/10' :
                                scanResult.status === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'
                                }`}>
                                {scanResult.status === 'processing' && (
                                    <>
                                        <Loader2 className="animate-spin text-blue-500 mb-4" size={64} strokeWidth={2.5} />
                                        <p className="text-blue-400 font-black text-xl tracking-tighter uppercase">Verifying Ticket...</p>
                                    </>
                                )}
                                {scanResult.status === 'success' && (
                                    <>
                                        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-2xl shadow-green-500/50 animate-in zoom-in duration-300">
                                            <CheckCircle size={56} strokeWidth={2.5} />
                                        </div>
                                        <p className="text-green-500 font-black text-2xl tracking-tight uppercase">Confirmed!</p>
                                        <p className="text-green-400/70 text-sm font-bold mt-1">Attendance Sync Complete</p>
                                    </>
                                )}
                                {scanResult.status === 'error' && (
                                    <>
                                        <div className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center mb-4 shadow-2xl shadow-red-500/50 animate-in zoom-in duration-300">
                                            <XCircle size={56} strokeWidth={2.5} />
                                        </div>
                                        <p className="text-red-500 font-black text-2xl tracking-tight uppercase">Error</p>
                                        <p className="text-red-400/70 text-sm font-bold mt-1">{scanResult.message}</p>
                                    </>
                                )}
                            </div>
                        )}

                        {!scanResult && !processing && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 z-10">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <p className="text-white text-[10px] font-black uppercase tracking-widest leading-none">Scanning Active</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                            <Camera size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Method</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Camera Scan</p>
                        </div>
                    </div>
                    <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">Real-time sync</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminScanner;
