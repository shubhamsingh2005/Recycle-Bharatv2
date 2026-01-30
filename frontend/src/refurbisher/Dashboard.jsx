import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRefurbish } from '../hooks/useRefurbish';
import {
    RefreshCw, Package, Truck, CheckCircle, CheckCircle2, Info,
    Smartphone, Search, Loader2, AlertCircle, Trash2, Clock
} from 'lucide-react';

export default function RefurbisherDashboard() {
    const {
        jobs, agents, recyclers, isLoading,
        acceptJob, isAccepting,
        assignAgent, isAssigning,
        confirmArrival, isConfirmingArrival,
        submitProposal, isSubmittingProposal,
        requestWasteHandover, isRequestingWaste
    } = useRefurbish();
    const [search, setSearch] = useState('');

    // New Dialog States
    const [wasteDialogOpen, setWasteDialogOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedRecyclerId, setSelectedRecyclerId] = useState('');

    const handleOpenWasteDialog = (deviceId) => {
        setSelectedJobId(deviceId);
        setWasteDialogOpen(true);
    };

    const handleConfirmWaste = async (e) => {
        e.preventDefault();
        try {
            await requestWasteHandover({ deviceId: selectedJobId, recyclerId: selectedRecyclerId });
            setWasteDialogOpen(false);
            setSelectedJobId(null);
            setSelectedRecyclerId('');
        } catch (err) {
            console.error(err);
        }
    };

    const filteredJobs = jobs?.filter(j =>
        j.model?.toLowerCase().includes(search.toLowerCase()) ||
        j.device_id?.toString().includes(search)
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Refurbish Center</h1>
                        <p className="text-slate-500 font-medium">Diagnostic Queue & Circular Logistics</p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Model or Code..."
                            className="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-900 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unassigned</p>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{jobs?.filter(j => j.job_status === 'REQUESTED').length || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                            <Truck className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Diagnostic</p>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{jobs?.filter(j => j.job_status === 'DIAGNOSTIC').length || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Repair</p>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white">{jobs?.filter(j => j.job_status === 'REPAIRING').length || 0}</h3>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Job List */}
                <div className="grid grid-cols-1 gap-6">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500 mb-4" />
                            <p className="text-slate-400 animate-pulse">Loading queue...</p>
                        </div>
                    ) : filteredJobs?.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
                            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No active jobs found.</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <JobCard
                                key={job.device_id}
                                job={job}
                                agents={agents}
                                acceptJob={acceptJob}
                                isAccepting={isAccepting}
                                assignAgent={assignAgent}
                                isAssigning={isAssigning}
                                confirmArrival={confirmArrival}
                                isConfirmingArrival={isConfirmingArrival}
                                submitProposal={submitProposal}
                                isSubmittingProposal={isSubmittingProposal}
                                onRequestWaste={() => handleOpenWasteDialog(job.device_id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Waste Handover Dialog */}
            {wasteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-[2rem] w-full max-w-md space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="space-y-2 relative z-10">
                            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mb-2">
                                <Trash2 className="w-7 h-7 text-orange-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Call Recycler</h3>
                            <p className="text-sm text-slate-500 font-medium">Select a licensed recycler to pick up the e-waste.</p>
                        </div>

                        <form onSubmit={handleConfirmWaste} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Partner</label>
                                <select
                                    className="w-full h-14 pl-4 pr-10 bg-slate-50 dark:bg-slate-800 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-700 dark:text-white appearance-none"
                                    value={selectedRecyclerId}
                                    onChange={e => setSelectedRecyclerId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a Recycler...</option>
                                    {recyclers?.map(r => (
                                        <option key={r.id} value={r.id}>{r.full_name} ({r.address || 'Standard Pickup'})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <Button type="button" variant="ghost" onClick={() => setWasteDialogOpen(false)} className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</Button>
                                <Button type="submit" disabled={isRequestingWaste || !selectedRecyclerId} className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-900/20">
                                    {isRequestingWaste ? <Loader2 className="animate-spin" /> : 'Confirm Request'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function JobCard({
    job, agents,
    acceptJob, isAccepting,
    assignAgent, isAssigning,
    confirmArrival, isConfirmingArrival,
    submitProposal, isSubmittingProposal,
    onRequestWaste
}) {
    const [selectedAgent, setSelectedAgent] = useState('');
    const [arrivalCode, setArrivalCode] = useState('');
    const [diagReport, setDiagReport] = useState('');
    const [repairCost, setRepairCost] = useState('');
    const [buybackValue, setBuybackValue] = useState('');

    const statusStyles = {
        REQUESTED: 'bg-slate-500/10 text-slate-500',
        DIAGNOSTIC: 'bg-blue-500/10 text-blue-500',
        ASSIGNED: 'bg-amber-500/10 text-amber-500',
        PICKED_UP: 'bg-purple-500/10 text-purple-500',
        PROPOSED: 'bg-amber-500/10 text-amber-500',
        IN_REPAIR: 'bg-emerald-500/10 text-emerald-500',
        COMPLETED: 'bg-slate-500/10 text-slate-500'
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="p-8 flex flex-col lg:flex-row gap-8">
                {/* Device Info (Left) */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                                <Smartphone className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{job.model}</h2>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">{job.brand} | {job.device_type}</p>
                            </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyles[job.job_status]}`}>
                            {job.job_status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Citizen</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{job.citizen_name}</p>
                            <p className="text-[10px] text-slate-500">{job.citizen_email}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Created</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(job.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Actions Section (Right) */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-800/20 p-8 rounded-[32px] border border-slate-100 dark:border-white/5">
                    {/* State: Requested (New) */}
                    {job.job_status === 'REQUESTED' && (
                        <div className="space-y-4 text-center">
                            <div className="space-y-1">
                                <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase">New Request</h3>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Citizen is waiting for confirmation</p>
                            </div>
                            <Button
                                disabled={isAccepting}
                                onClick={() => acceptJob({ deviceId: job.device_id })}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black shadow-xl shadow-blue-900/20"
                            >
                                {isAccepting ? <Loader2 className="animate-spin w-5 h-5" /> : 'ACCEPT REQUEST'}
                            </Button>
                        </div>
                    )}

                    {/* State: Accepted but Unassigned */}
                    {job.agent_id === null && job.job_status === 'ACCEPTED' && (
                        <div className="space-y-4">
                            <div className="text-center space-y-1">
                                <h3 className="font-black text-lg text-slate-800 dark:text-white">ASSIGN FIELD AGENT</h3>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Select agent for doorstep pickup</p>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    disabled={isAssigning}
                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                    value={selectedAgent}
                                    onChange={e => setSelectedAgent(e.target.value)}
                                >
                                    <option value="">Select Agent...</option>
                                    {agents?.map(a => (
                                        <option key={a.id} value={a.id}>{a.full_name}</option>
                                    ))}
                                </select>
                                <Button
                                    disabled={!selectedAgent || isAssigning}
                                    onClick={() => assignAgent({ deviceId: job.device_id, agentId: selectedAgent })}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-6 font-bold shadow-lg shadow-blue-900/20"
                                >
                                    {isAssigning ? <Loader2 className="animate-spin w-4 h-4" /> : 'ASSIGN'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* State: Picked Up -> Waiting for Facility Handover */}
                    {job.job_status === 'PICKED_UP' && (
                        <div className="space-y-4">
                            <div className="text-center space-y-1">
                                <h3 className="font-black text-lg text-slate-800 dark:text-white">FACILITY HANDOVER</h3>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Verify device arrival at center</p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    disabled={isConfirmingArrival}
                                    placeholder="Enter Handy Code"
                                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                                    value={arrivalCode}
                                    onChange={e => setArrivalCode(e.target.value)}
                                />
                                <Button
                                    disabled={isConfirmingArrival}
                                    onClick={() => confirmArrival({ deviceId: job.device_id, pickupCode: arrivalCode })}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-6 font-bold shadow-lg shadow-purple-900/20"
                                >
                                    {isConfirmingArrival ? <Loader2 className="animate-spin w-4 h-4" /> : 'ARRIVED'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* State: Assigned but not picked up */}
                    {job.agent_id && job.job_status === 'ASSIGNED' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center animate-bounce">
                                <Truck className="w-8 h-8 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">In Transit for Pickup</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Agent is on the way to collect the device from citizen.</p>
                            </div>
                        </div>
                    )}

                    {/* State: Under Diagnostic */}
                    {job.job_status === 'DIAGNOSTIC' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="font-black text-lg text-slate-800 dark:text-white">SUBMIT PROPOSAL</h3>
                            </div>
                            <div className="space-y-4">
                                <textarea
                                    placeholder="Brief diagnostic report (e.g. Broken screen, battery health 70%)"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs h-24 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                                    value={diagReport}
                                    onChange={e => setDiagReport(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Repair Cost (₹)"
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={repairCost}
                                        onChange={e => setRepairCost(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Buyback (₹)"
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={buybackValue}
                                        onChange={e => setBuybackValue(e.target.value)}
                                    />
                                </div>
                                <Button
                                    disabled={isSubmittingProposal}
                                    onClick={() => submitProposal({ deviceId: job.device_id, repairQuote: repairCost, buybackQuote: buybackValue, diagnosticReport: diagReport })}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl font-black shadow-lg shadow-emerald-900/20 transition-transform active:scale-95"
                                >
                                    {isSubmittingProposal ? <Loader2 className="animate-spin w-5 h-5" /> : 'SEND TO CITIZEN'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* State: Decision Pending */}
                    {job.job_status === 'PROPOSED' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center animate-pulse">
                                <Clock className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase">Waiting for Decision</h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Citizen is reviewing the proposal.</p>
                                </div>
                                <div className="flex gap-2 justify-center">
                                    <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Repair</p>
                                        <p className="text-sm font-black text-emerald-600">₹{parseFloat(job.repair_quote).toLocaleString()}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Buyback</p>
                                        <p className="text-sm font-black text-blue-600">₹{parseFloat(job.buyback_quote).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* State: Post Decision Actions */}
                    {(job.citizen_decision === 'APPROVE_REPAIR' || job.citizen_decision === 'SELL_COMPONENTS') && job.job_status !== 'COMPLETED' && (
                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl border ${job.citizen_decision === 'APPROVE_REPAIR' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
                                <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1 tracking-tight uppercase">
                                    {job.citizen_decision === 'APPROVE_REPAIR' ? 'Proceed with Repair' : 'Parts Extracted'}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {job.citizen_decision === 'APPROVE_REPAIR'
                                        ? 'Fix the device and return using RTN code.'
                                        : 'Extract reusable components. Request recycler for junk.'}
                                </p>
                            </div>

                            {job.citizen_decision === 'SELL_COMPONENTS' && (
                                <div className="space-y-4">
                                    {job.device_state === 'WASTE_HANDOVER_PENDING' || job.device_state === 'COLLECTOR_ASSIGNED' ? (
                                        <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-center animate-in zoom-in-95">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Truck className="w-5 h-5 text-orange-600" />
                                                <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Recycler Assigned</span>
                                            </div>

                                            {job.current_duc && (
                                                <div className="my-3 p-3 bg-white dark:bg-black/20 rounded-xl border border-orange-500/10">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Pickup Code (DUC)</p>
                                                    <div className="text-xl font-mono font-black text-slate-800 dark:text-white tracking-widest select-all">
                                                        {job.current_duc}
                                                    </div>
                                                    <p className="text-[9px] text-slate-400 mt-1">Share with recycler upon pickup.</p>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-slate-500 font-medium">Waste handover request is active. Waiting for cleanup.</p>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onRequestWaste}
                                                className="mt-2 text-[10px] text-orange-600 hover:text-orange-700 hover:bg-orange-100 h-6 px-2"
                                            >
                                                Change Recycler
                                            </Button>
                                        </div>
                                    ) : job.device_state === 'COLLECTED' || job.device_state === 'RECYCLED' ? (
                                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Waste Collected</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500">Handover complete.</p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={onRequestWaste}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-14 rounded-2xl font-black shadow-xl shadow-orange-900/40"
                                        >
                                            CALL RECYCLER (WASTE)
                                        </Button>
                                    )}
                                </div>
                            )}

                            {job.citizen_decision === 'APPROVE_REPAIR' && (
                                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-dashed border-emerald-500/20 text-center">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Repair Verification</span>
                                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono tracking-tighter italic">WAITING FOR RETURN</div>
                                    <p className="text-[10px] text-slate-500 mt-2 italic">Citizen must verify return via RTN code on delivery.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
