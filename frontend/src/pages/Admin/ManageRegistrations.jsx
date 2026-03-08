import React, { useEffect, useState } from 'react';
import { getRegistrationsByEvent } from '../../services/registrationService';
import { getEvents } from '../../services/eventService';
import { useToast } from '../../components/ui/Toast';
import { User, Calendar, MapPin, Users, ArrowLeft, Trash2, CheckCircle } from 'lucide-react';

const ManageRegistrations = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [regsLoading, setRegsLoading] = useState(false);
    const { toast, ToastContainer } = useToast();

    const loadEvents = async () => {
        setLoading(true);
        try {
            const res = await getEvents(1, 100); // Fetch a good number of events
            setEvents(res.items || []);
        } catch (error) {
            toast.error('Failed to load events.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const viewRegistrations = async (event) => {
        setSelectedEvent(event);
        setRegsLoading(true);
        try {
            const data = await getRegistrationsByEvent(event.id || event._id);
            setRegistrations(data);
        } catch (error) {
            toast.error('Failed to load registrations.');
        } finally {
            setRegsLoading(false);
        }
    };

    const backToGrid = () => {
        setSelectedEvent(null);
        setRegistrations([]);
    };

    if (selectedEvent) {
        return (
            <div className="p-4 sm:p-6 lg:p-10 min-h-full bg-[var(--bg-main)]">
                <ToastContainer />

                <button
                    onClick={backToGrid}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
                >
                    <ArrowLeft size={16} /> Back to Events
                </button>

                <div className="mb-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[var(--text-primary)]">{selectedEvent.title}</h1>
                            <p className="text-slate-500 text-sm font-medium">Registrations Management</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/40 border-bottom border-[var(--border)]">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Student Info</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Email</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Semester</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regsLoading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse border-b border-slate-800/50">
                                            <td colSpan="4" className="px-6 py-8">
                                                <div className="h-4 bg-slate-800 rounded-full w-3/4 mb-2"></div>
                                                <div className="h-4 bg-slate-800 rounded-full w-1/2"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : registrations.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="bg-slate-800/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Users className="text-slate-600" size={32} />
                                            </div>
                                            <p className="text-slate-500 font-bold">No students registered yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    registrations.map(reg => (
                                        <tr key={reg.id || reg._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                                        <User size={18} />
                                                    </div>
                                                    <span className="text-[var(--text-primary)] font-bold">{reg.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-slate-400 font-medium">{reg.email}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-xs font-black uppercase">
                                                    Sem {reg.semester || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
                                                    <CheckCircle size={14} /> Confirmed
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-10 min-h-full bg-[var(--bg-main)]">
            <ToastContainer />

            <div className="mb-10">
                <h1 className="text-[clamp(24px,5vw,32px)] font-black text-[var(--text-primary)] mb-2 tracking-tight">🎓 Event Registrations</h1>
                <p className="text-slate-500 text-sm font-medium">Select an event to view and manage registered students</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-60 rounded-[2rem] bg-slate-900/50 border border-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/20 rounded-[2.5rem] border border-dashed border-slate-800">
                    <p className="text-slate-500 font-bold">No events available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(ev => (
                        <div
                            key={ev.id || ev._id}
                            onClick={() => viewRegistrations(ev)}
                            className="group relative bg-[var(--bg-card)] border border-[var(--border)] rounded-[2.5rem] p-6 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden shadow-xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex flex-col h-full gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Calendar size={24} />
                                    </div>
                                    <span className="px-4 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        {ev.semester === 'All' ? 'All Sem' : `Sem ${ev.semester}`}
                                    </span>
                                </div>

                                <div className="mt-2">
                                    <h3 className="text-lg font-black text-[var(--text-primary)] leading-tight mb-2 group-hover:text-blue-400 transition-colors">
                                        {ev.title}
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                            <MapPin size={14} /> {ev.location || 'No Location'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-800/50">
                                    <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-wider">
                                        <Users size={16} /> View Registrations
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageRegistrations;
