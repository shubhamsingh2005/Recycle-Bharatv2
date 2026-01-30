import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDevice, useDevices } from '../hooks/useDevices';
import {
    ArrowLeft, CheckCircle2, Circle, Clock, Truck, Recycle,
    ShieldAlert, Eye, EyeOff, Loader2, Info, Smartphone, Lock, RefreshCw,
    ClipboardCheck, Wrench, Banknote
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/axios';

export default function DeviceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: device, isLoading, error } = useDevice(id);
    const { requestRecycle, isRecycling, requestRefurbish, isRefurbishing, respondToProposal, verifyReturn, isVerifyingReturn, revealDuc } = useDevices();
    const isRevealing = false; // revealDuc is simple async in useDevices, stubbed isRevealing here
    const { t } = useLanguage();

    const [revealedDuc, setRevealedDuc] = useState(null);

    const handleReveal = async () => {
        try {
            const res = await revealDuc(device._id);
            setRevealedDuc(res.rawDuc || res.pickupCode);
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            <p className="animate-pulse">Retrieving device identity...</p>
        </div>
    );

    if (error || !device) return (
        <div className="p-8 text-center bg-red-500/5 rounded-2xl border border-red-500/10 max-w-lg mx-auto mt-20">
            <h3 className="text-xl font-bold text-red-400 mb-2">Device Not Found</h3>
            <p className="text-slate-400 text-sm mb-6">The device you are looking for does not exist or you do not have permission to view it.</p>
            <Button onClick={() => navigate('/citizen/dashboard')}>Back to Dashboard</Button>
        </div>
    );



    const recyclingTimeline = [
        { state: 'ACTIVE', label: t.registered, completed: !!device.createdAt },
        { state: 'RECYCLING_REQUESTED', label: t.recycleCalled, completed: ['RECYCLING_REQUESTED', 'COLLECTOR_ASSIGNED', 'COLLECTED', 'DELIVERED_TO_RECYCLER', 'RECYCLED'].includes(device.status) },
        { state: 'COLLECTOR_ASSIGNED', label: t.agentDispatched, completed: ['COLLECTOR_ASSIGNED', 'COLLECTED', 'DELIVERED_TO_RECYCLER', 'RECYCLED'].includes(device.status) },
        { state: 'COLLECTED', label: t.inTransit, completed: ['COLLECTED', 'DELIVERED_TO_RECYCLER', 'RECYCLED'].includes(device.status) },
        { state: 'DELIVERED_TO_RECYCLER', label: t.reachedFacility, completed: ['DELIVERED_TO_RECYCLER', 'RECYCLED'].includes(device.status) },
        { state: 'RECYCLED', label: t.fullyRecycling, completed: device.status === 'RECYCLED' },
    ];

    const refurbTimeline = [
        { state: 'ACTIVE', label: 'Device Listed', completed: true },
        { state: 'REFURB_DIAGNOSTIC_REQUESTED', label: 'Diagnostic Called', completed: ['REFURB_DIAGNOSTIC_REQUESTED', 'REFURB_ACCEPTED', 'REFURB_AGENT_ASSIGNED', 'REFURB_PICKED_UP', 'UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING', 'REPAIRING', 'WASTE_HANDOVER_PENDING'].includes(device.status) },
        { state: 'REFURB_ACCEPTED', label: 'Request Accepted', completed: ['REFURB_ACCEPTED', 'REFURB_AGENT_ASSIGNED', 'REFURB_PICKED_UP', 'UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING', 'REPAIRING', 'WASTE_HANDOVER_PENDING'].includes(device.status) },
        { state: 'REFURB_AGENT_ASSIGNED', label: 'Agent Assigned', completed: ['REFURB_AGENT_ASSIGNED', 'REFURB_PICKED_UP', 'UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING', 'REPAIRING', 'WASTE_HANDOVER_PENDING'].includes(device.status) },
        { state: 'REFURB_PICKED_UP', label: 'Collected from Doorstep', completed: ['REFURB_PICKED_UP', 'UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING', 'REPAIRING', 'WASTE_HANDOVER_PENDING'].includes(device.status) },
        { state: 'UNDER_DIAGNOSTIC', label: 'Reached Facility', completed: ['UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING', 'REPAIRING', 'WASTE_HANDOVER_PENDING'].includes(device.status) },
        { state: 'PROPOSAL_PENDING', label: 'Proposal Sent', completed: ['PROPOSAL_PENDING', 'REPAIRING', 'WASTE_HANDOVER_PENDING'].includes(device.status) },
        { state: 'REPAIRING', label: 'In Repair/Process', completed: ['REPAIRING', 'WASTE_HANDOVER_PENDING'].includes(device.status) },
        { state: 'ACTIVE', label: 'Returned & Active', completed: device.status === 'ACTIVE' && !!device.updatedAt },
    ];



    const statusLabels = {
        COLLECTED: t.inTransit,
        DELIVERED_TO_RECYCLER: t.reachedFacility,
        COLLECTOR_ASSIGNED: t.agentDispatched,
        ACTIVE: t.activeInventory,
        RECYCLING_REQUESTED: t.recycleCalled,
        RECYCLED: t.fullyRecycling,
        REFURB_DIAGNOSTIC_REQUESTED: 'Diagnostic Requested',
        REFURB_ACCEPTED: 'Request Accepted',
        REFURB_AGENT_ASSIGNED: 'Agent Assigned',
        REFURB_PICKED_UP: 'In Transit to Center',
        UNDER_DIAGNOSTIC: 'Under Evaluation',
        PROPOSAL_PENDING: 'Review Proposal',
        REPAIRING: 'Authorized Repairing',
        COMPONENTS_SOLD: 'Components Recovered',
        WASTE_HANDOVER_PENDING: 'Waste Logistics'
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white pl-0 gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {t.backToMyDevices}
                </Button>
                {device.isTerminated && (
                    <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {t.archivedProfile}
                    </div>
                )}
            </div>

            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-xl dark:shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-start gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{device.model}</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                            <span className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 font-mono text-xs select-all uppercase tracking-wider">{device.uid}</span>
                            <span className="w-1 h-1 bg-slate-400 dark:bg-slate-700 rounded-full" />
                            <span className="text-slate-500 italic">Added {new Date(device.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Device Status</span>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm shadow-lg ${device.status === 'RECYCLED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            device.status === 'ACTIVE' ? 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10' :
                                'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}>
                            {device.status === 'RECYCLED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
                            {statusLabels[device.status] || device.status.replace(/_/g, ' ')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recycler Timeline */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-lg dark:shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                            {t.recyclingTimeline || "Recycler Timeline"}
                        </h3>
                        <div className="space-y-10 relative pl-4">
                            <div className="absolute left-[31px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800/50" />

                            {recyclingTimeline.map((step, idx) => (
                                <div key={idx} className="relative flex gap-6 group">
                                    <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-2xl border-2 transition-all duration-500 ${step.completed ? 'bg-emerald-500 border-emerald-500 text-white dark:text-black shadow-lg shadow-emerald-500/20 scale-110' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-500'}`}>
                                        {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />}
                                    </div>
                                    <div className="pt-0.5">
                                        <div className={`font-bold transition-colors ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                                            {step.label}
                                        </div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter font-medium">
                                            {step.completed ? t.verifiedEntry : t.pendingStage}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Refurbisher Timeline */}
                    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-lg dark:shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                            {t.refurbishingTimeline || "Refurbisher Timeline"}
                        </h3>
                        <div className="space-y-10 relative pl-4">
                            <div className="absolute left-[31px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800/50" />

                            {refurbTimeline.map((step, idx) => (
                                <div key={idx} className="relative flex gap-6 group">
                                    <div className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-2xl border-2 transition-all duration-500 ${step.completed ? 'bg-blue-500 border-blue-500 text-white dark:text-black shadow-lg shadow-blue-500/20 scale-110' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-500'}`}>
                                        {step.completed ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full" />}
                                    </div>
                                    <div className="pt-0.5">
                                        <div className={`font-bold transition-colors ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                                            {step.label}
                                        </div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter font-medium">
                                            {step.completed ? t.verifiedEntry : t.pendingStage}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 rounded-3xl p-6 flex gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-2xl h-fit shadow-md dark:shadow-xl">
                            <ShieldAlert className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 dark:text-white">Requirement</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t.proofNotice}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Handover Data Column */}
                <div className="space-y-8">
                    {/* DUC SECTION */}
                    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-xl dark:shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                            {device.status === 'ACTIVE' ? <Lock className="w-8 h-8 text-slate-400 dark:text-slate-600" /> : <Lock className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {device.status === 'REPAIRING' ? 'Return Verification' : t.handoverCode}
                            </h3>
                            <p className="text-xs text-slate-500 px-4">
                                {device.status === 'ACTIVE'
                                    ? 'Locked until recycling or refurbishing is requested.'
                                    : (['UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING'].includes(device.status))
                                        ? 'Device is currently at our facility for diagnostic.'
                                        : device.status === 'REPAIRING'
                                            ? 'Verification code for when your device is delivered back.'
                                            : 'Provide this to the authorized collector at pickup time.'}
                            </p>
                        </div>

                        <div className="w-full space-y-4">
                            {device.status === 'ACTIVE' || ['UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING'].includes(device.status) ? (
                                <div className="p-6 bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3">
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-2 h-2 bg-slate-300 dark:bg-slate-800 rounded-full" />)}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                        {['UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING'].includes(device.status) ? 'In Facility' : 'Section Locked'}
                                    </p>
                                </div>
                            ) : (revealedDuc || device.currentDuc || device.returnCode) ? (
                                <div className="p-6 bg-emerald-50 dark:bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                                    <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-[0.2em] md:tracking-[0.5em] font-mono select-all">
                                        {device.status === 'REPAIRING' ? device.returnCode : (revealedDuc || device.currentDuc)}
                                    </span>
                                </div>
                            ) : (
                                <div className="p-6 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2">
                                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-3 h-3 bg-slate-300 dark:bg-slate-800 rounded-full animate-pulse" />)}
                                </div>
                            )}

                            <Button
                                onClick={handleReveal}
                                disabled={isRevealing || device.isTerminated || device.status === 'ACTIVE' || ['UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING', 'REPAIRING'].includes(device.status)}
                                className={`w-full h-12 rounded-2xl font-bold text-sm transition-all shadow-xl ${device.status === 'ACTIVE' || ['UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING', 'REPAIRING'].includes(device.status) ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600' :
                                    (revealedDuc || device.currentDuc) ? 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 dark:shadow-emerald-900/40 text-white'
                                    }`}
                            >
                                {isRevealing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : ((revealedDuc || device.currentDuc) ? <RefreshCw className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />)}
                                {device.status === 'ACTIVE' ? 'Code Unavailable' :
                                    ['UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING'].includes(device.status) ? 'At Facility' :
                                        device.status === 'REPAIRING' ? 'Repair Authorization Active' :
                                            (revealedDuc || device.currentDuc) ? t.regenerateCode : t.revealPickupCode}
                            </Button>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-600 font-medium">
                            {device.status === 'ACTIVE'
                                ? 'Submit a request below to generate your code.'
                                : ['UNDER_DIAGNOSTIC', 'PROPOSAL_PENDING'].includes(device.status)
                                    ? 'Pickup and handover is already completed.'
                                    : 'Each reveal/regeneration is logged for security auditing.'}
                        </p>
                    </div>

                    {/* Actions Card with Modal */}
                    {device.status === 'ACTIVE' && (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                            {/* Recycle Action */}
                            <div className="bg-emerald-50 dark:bg-emerald-600/10 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-6 space-y-4 shadow-xl dark:shadow-2xl">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Recycle className="w-5 h-5 text-emerald-600" /> Environment Path
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">High Credit Points | Direct Waste Loop</p>
                                </div>
                                <RecycleDialog
                                    deviceId={device._id}
                                    onConfirm={(data) => requestRecycle({ deviceId: device._id, ...data })}
                                    isLoading={isRecycling}
                                    t={t}
                                />
                            </div>

                            {/* Refurbish Action */}
                            <div className="bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/20 rounded-3xl p-6 space-y-4 shadow-xl dark:shadow-2xl">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 text-blue-600" /> Commercial Path
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">Cash Value or Repair | 48h Diagnostic</p>
                                </div>
                                <RefurbishDialog
                                    deviceId={device._id}
                                    onConfirm={(data) => requestRefurbish({ deviceId: device._id, ...data })}
                                    isLoading={isRefurbishing}
                                    t={t}
                                />
                                <p className="text-[10px] text-blue-500 font-bold text-center">Refurbish Fee: ₹199 (Simulated)</p>
                            </div>
                        </div>
                    )}

                    {device.status === 'PROPOSAL_PENDING' && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[32px] p-6 space-y-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                            <div className="text-center space-y-1 relative z-10">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-emerald-500/20 shadow-sm">
                                    <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Diagnostic Complete</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Decision Required</p>
                            </div>

                            {/* Compact Findings */}
                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] block mb-1">Refurbisher Report</span>
                                <p className="text-xs leading-relaxed font-bold text-slate-600 dark:text-slate-400 italic">
                                    "{device.diagnosticReport || 'Standard wear and tear observed.'}"
                                </p>
                            </div>

                            <div className="space-y-3">
                                {/* Compact Option: Repair */}
                                <button
                                    onClick={() => respondToProposal({ deviceId: device._id, decision: 'APPROVE_REPAIR' })}
                                    className="w-full group p-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl transition-all duration-300 shadow-md active:scale-[0.98] flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/10">
                                        <Wrench className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-black text-xs uppercase tracking-tight">Authorize Repair</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-emerald-100 font-medium">Cost:</span>
                                            <span className="text-sm font-black text-white">₹{parseFloat(device.repairQuote || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                                    </div>
                                </button>

                                {/* Compact Option: Sell */}
                                <button
                                    onClick={() => respondToProposal({ deviceId: device._id, decision: 'SELL_COMPONENTS' })}
                                    className="w-full group p-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-950 rounded-2xl transition-all duration-300 shadow-md active:scale-[0.98] border border-white/5 flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-white/10">
                                        <Banknote className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-black text-xs uppercase tracking-tight">Sell for Cash</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-400 font-medium tracking-tight">Value:</span>
                                            <span className="text-sm font-black text-emerald-400">₹{parseFloat(device.buybackQuote || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <ArrowLeft className="w-4 h-4 text-white rotate-180" />
                                    </div>
                                </button>
                            </div>

                            <div className="pt-2 flex flex-col items-center gap-1 opacity-60">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Offer expires in 48 hours</p>
                            </div>
                        </div>
                    )}

                    {device.status === 'COMPONENTS_SOLD' && (
                        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                            <div className="relative z-10 space-y-2">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h4 className="text-3xl font-black text-white tracking-tighter uppercase">Sold to Refurbisher</h4>
                                <p className="text-sm text-slate-400 font-medium max-w-md mx-auto">Ownership has been successfully transferred. Payments are processed to your linked account.</p>
                            </div>

                            <div className="inline-flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="text-right border-r border-white/10 pr-4">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Buyer</p>
                                    <p className="text-sm font-bold text-white">{device.refurbisher_name || 'Authorized Partner'}</p>
                                </div>
                                <div className="text-left pl-2">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Amount</p>
                                    <p className="text-xl font-black text-emerald-400">₹{parseFloat(device.buybackQuote || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {device.status === 'REPAIRING' && (
                        <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/30 rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-500">
                            <div className="text-center space-y-2">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Truck className="w-7 h-7 text-blue-600 animate-bounce" />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirm Verified Return</h4>
                                <p className="text-xs text-slate-500 font-medium">Enter the 6-digit RTN code provided by the agent at delivery.</p>
                            </div>

                            <ReturnCodeSection
                                deviceId={device._id}
                                onVerify={(code) => verifyReturn({ deviceId: device._id, returnCode: code })}
                                isVerifying={isVerifyingReturn}
                            />
                        </div>
                    )}

                    {device.status === 'RECYCLED' && (
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-8 text-center space-y-4 shadow-xl dark:shadow-2xl">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Device Recycled</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Lifecycle completed successfully. Verified sustainability points have been credited.</p>
                            <Button variant="ghost" onClick={() => navigate('/citizen/rewards')} className="w-full text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/10">
                                View Your Credits
                            </Button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

const RecycleDialog = ({ deviceId, onConfirm, isLoading, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [address, setAddress] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await onConfirm({
                pickup_address: address,
                preferred_date: date,
                pickup_latitude: 12.9716, // Mock for now 
                pickup_longitude: 77.5946
            });
            setIsOpen(false);
        } catch (err) {
            console.error("Recycling request failed in dialog:", err);
            // Ideally notify user here
        }
    };

    if (!isOpen) return (
        <Button
            onClick={() => setIsOpen(true)}
            className='w-full h-12 rounded-2xl font-black shadow-emerald-900/40 bg-emerald-600 hover:bg-emerald-500 text-white'
        >
            <Recycle className='w-4 h-4 mr-2' />
            {t.callForRecycling}
        </Button>
    );

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
            <div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl'>
                <h3 className='text-xl font-bold text-slate-900 dark:text-white'>{t.confirmPickupDetails}</h3>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label htmlFor="pickup_address_input" className='text-sm text-slate-600 dark:text-slate-400'>{t.pickupAddress}</label>
                        <textarea
                            id="pickup_address_input"
                            name="pickup_address_input"
                            required
                            className='w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white mt-1 focus:ring-2 focus:ring-emerald-500 outline-none transition-all'
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="pickup_date_input" className='text-sm text-slate-600 dark:text-slate-400'>{t.preferredDate}</label>
                        <input
                            id="pickup_date_input"
                            name="pickup_date_input"
                            type='date'
                            required
                            className='w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white mt-1 focus:ring-2 focus:ring-emerald-500 outline-none transition-all'
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                    <div className='flex gap-3 pt-2'>
                        <Button type='button' variant='ghost' onClick={() => setIsOpen(false)} className='flex-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'>{t.cancel}</Button>
                        <Button type='submit' disabled={isLoading} className='flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'>
                            {isLoading ? t.processing : t.confirmRequest}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RefurbishDialog = ({ deviceId, onConfirm, isLoading, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [address, setAddress] = useState('');

    const { data: refurbishers } = useQuery({
        queryKey: ['refurbishers'],
        queryFn: async () => {
            const res = await api.get('/public/refurbishers');
            return res.data;
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Pick a real refurbisher ID from the list
            const refurbId = refurbishers?.[0]?.id || 4; // Fallback to 4 for demo robustness

            await onConfirm({
                refurbisher_id: refurbId,
                pickup_address: address
            });
            setIsOpen(false);
        } catch (err) {
            console.error("Refurbish request failed:", err);
        }
    };

    if (!isOpen) return (
        <Button
            onClick={() => setIsOpen(true)}
            className='w-full h-12 rounded-2xl font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
        >
            <RefreshCw className='w-4 h-4 mr-2' />
            Check Refurbish Value
        </Button>
    );

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
            <div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl'>
                <div className="text-center space-y-2">
                    <h3 className='text-2xl font-black text-slate-900 dark:text-white'>Diagnostic Request</h3>
                    <p className="text-xs text-slate-500">A govt-approved refurbisher agent will collect your device for a 48h diagnostic check.</p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className="space-y-2">
                        <label className='text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1'>Pickup Address</label>
                        <textarea
                            required
                            className='w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-all resize-none h-32'
                            placeholder="Enter full address for doorstep collection..."
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                        <div className="flex justify-between items-center text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                            <span>Pre-Diagnostic Fee</span>
                            <span>₹199*</span>
                        </div>
                    </div>

                    <div className='flex gap-4'>
                        <Button type='button' variant='ghost' onClick={() => setIsOpen(false)} className='flex-1 h-12 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'>Cancel</Button>
                        <Button type='submit' disabled={isLoading} className='flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-900/40'>
                            {isLoading ? 'Processing...' : 'Pay & Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReturnCodeSection = ({ onVerify, isVerifying }) => {
    const [code, setCode] = useState('');

    return (
        <div className="space-y-4">
            <input
                type="text"
                maxLength={10}
                placeholder="RTN-XXXXXX"
                className="w-full h-14 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-xl font-black text-center tracking-[0.3em] font-mono focus:border-blue-500 outline-none transition-all shadow-inner"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
            />
            <Button
                disabled={isVerifying || code.length < 4}
                onClick={() => onVerify(code)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-900/40"
            >
                {isVerifying ? <Loader2 className="animate-spin" /> : 'CONFIRM RETURN'}
            </Button>
        </div>
    );
};
