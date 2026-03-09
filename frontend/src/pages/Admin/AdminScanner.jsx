import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Scan, CheckCircle, XCircle, Loader2, ArrowLeft, Camera, Shield, Zap, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { apiFetch } from '../../services/api';

const AdminScanner = () => {
    const navigate = useNavigate();
    const { toast, ToastContainer } = useToast();
    const [scanResult, setScanResult] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Delay scanner initialization slightly to ensure DOM is ready
        const timer = setTimeout(() => {
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: { width: 250, height: 250 },
                fps: 20, // Increased for smoother detection
                aspectRatio: 1.0
            });

            scanner.render(onScanSuccess, onScanError);

            function onScanError(err) {
                // Ignore noise
            }

            return () => {
                scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            };
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const onScanSuccess = async (decodedText) => {
        if (processing || scanResult) return;

        // Basic validation: MongoDB IDs are 24 chars
        if (decodedText.length !== 24) {
            toast.error('Invalid Ticket Format');
            return;
        }

        setProcessing(true);
        setScanResult({ status: 'processing', text: decodedText });

        try {
            await apiFetch(`/registrations/${decodedText}/attend`, {
                method: 'PUT'
            });

            setScanResult({ status: 'success', message: 'Attendance Verified' });
            toast.success('Access Granted');
        } catch (err) {
            setScanResult({
                status: 'error',
                message: err.message || 'Verification Failed'
            });
            toast.error('Scan Error');
        } finally {
            setProcessing(false);
            // Auto-reset after 2.5 seconds to allow next scan
            setTimeout(() => setScanResult(null), 2500);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 relative overflow-hidden flex flex-col">
            <ToastContainer />

            {/* ── Background Aesthetics ── */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>


            {/* ── Main Content ── */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full">

                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Attendance <span className="text-blue-500 font-extrabold italic">Terminal</span></h1>
                    <p className="text-slate-500 font-medium">Scan student digital passes for rapid attendance verification.</p>
                </div>

                {/* ── Scanner Housing ── */}
                <div className="w-full relative group">
                    {/* Glowing outer frame */}
                    <div className={`absolute -inset-1 rounded-[2.5rem] blur opacity-30 transition-all duration-500 ${scanResult?.status === 'success' ? 'bg-green-500 opacity-60' :
                        scanResult?.status === 'error' ? 'bg-red-500 opacity-60' :
                            'bg-blue-600 group-hover:opacity-50'
                        }`} />

                    <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl aspect-square sm:aspect-auto">

                        {/* The HTML5 QR Component */}
                        <div id="reader" className="w-full overflow-hidden" style={{ border: 'none' }}></div>

                        {/* Scanner Overlay UI (Manual) */}
                        {!scanResult && !processing && (
                            <>
                                {/* Corner Accents */}
                                <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-blue-500/60 rounded-tl-xl pointer-events-none" />
                                <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-blue-500/60 rounded-tr-xl pointer-events-none" />
                                <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-blue-500/60 rounded-bl-xl pointer-events-none" />
                                <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-blue-500/60 rounded-br-xl pointer-events-none" />

                                {/* Scanning Laser Line */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[scan_3s_ease-in-out_infinite] z-10 opacity-50" />

                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 animate-pulse">
                                    <Zap size={16} className="text-blue-400 fill-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Ready for Input</span>
                                </div>
                            </>
                        )}

                        {/* Processing / Result Overlay */}
                        {scanResult && (
                            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-xl animate-in fade-in zoom-in duration-300 ${scanResult.status === 'success' ? 'bg-green-950/40' :
                                scanResult.status === 'error' ? 'bg-red-950/40' :
                                    'bg-blue-950/40'
                                }`}>
                                {scanResult.status === 'processing' && (
                                    <>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
                                            <Loader2 className="animate-spin text-blue-500 mb-6 relative" size={80} strokeWidth={1} />
                                        </div>
                                        <p className="text-blue-400 font-black text-2xl tracking-tighter uppercase italic">Syncing DB...</p>
                                    </>
                                )}

                                {scanResult.status === 'success' && (
                                    <>
                                        <div className="w-28 h-28 bg-green-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.4)] rotate-3 animate-in bounce-in duration-500">
                                            <CheckCircle size={64} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-white font-black text-3xl tracking-tight mb-1">AUTHORIZED</h3>
                                        <p className="text-green-400 font-bold uppercase text-[10px] tracking-widest">{scanResult.message}</p>
                                    </>
                                )}

                                {scanResult.status === 'error' && (
                                    <>
                                        <div className="w-28 h-28 bg-red-600 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(220,38,38,0.4)] rotate-[-3deg] animate-in bounce-in duration-500">
                                            <XCircle size={64} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-white font-black text-3xl tracking-tight mb-1">DENIED</h3>
                                        <p className="text-red-400 font-bold uppercase text-[10px] tracking-widest">{scanResult.message}</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Instructional Meta ── */}
                <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                    <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-800 flex items-center gap-4 hover:bg-slate-900/60 transition-colors">
                        <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-400">
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alignment</p>
                            <p className="text-xs font-bold text-white">Center QR Code</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-3xl bg-slate-900/40 border border-slate-800 flex items-center gap-4 hover:bg-slate-900/60 transition-colors">
                        <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-500">
                            <Camera size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lighting</p>
                            <p className="text-xs font-bold text-white">Avoid Glare</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Progress Indicator Footer ── */}
            <footer className="relative z-10 p-8 text-center border-t border-slate-900 mt-auto">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Encrypted End-to-End Validation</p>
            </footer>

            <style>{`
                @keyframes scan {
                    0%, 100% { top: 10%; }
                    50% { top: 90%; }
                }
                #reader button {
                    background: #2563eb !important;
                    color: white !important;
                    border: none !important;
                    padding: 10px 20px !important;
                    border-radius: 12px !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    font-size: 11px !important;
                    letter-spacing: 0.1em !important;
                    cursor: pointer !important;
                    margin: 20px auto !important;
                    display: block !important;
                    transition: all 0.2s !important;
                }
                #reader button:hover {
                    box-shadow: 0 0 20px rgba(37, 99, 235, 0.4) !important;
                    transform: translateY(-2px) !important;
                }
                #reader select {
                    background: #1e293b !important;
                    color: white !important;
                    border: 1px solid #334155 !important;
                    padding: 8px !important;
                    border-radius: 10px !important;
                    font-size: 13px !important;
                    outline: none !important;
                }
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__dashboard_section_csr button {
                    display: none !important;
                }
                #reader video {
                    object-fit: cover !important;
                    border-radius: 20px !important;
                }
            `}</style>
        </div>
    );
};

export default AdminScanner;
