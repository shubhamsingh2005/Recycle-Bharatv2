import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRefurbish } from '../hooks/useRefurbish';
import {
    Truck, MapPin, Phone, ShieldCheck,
    Smartphone, Search, Loader2, PackageOpen
} from 'lucide-react';

export default function RefurbisherAgentDashboard() {
    const { jobs, isLoading, verifyPickup, isVerifyingPickup } = useRefurbish();
    const [pickupCode, setPickupCode] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);

    const pendingPickups = jobs?.filter(j => j.job_status === 'ASSIGNED') || [];
    const inTransit = jobs?.filter(j => j.job_status === 'PICKED_UP') || [];

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
            <p className="text-slate-500 font-medium tracking-tight">Syncing Field Assignments...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="text-center md:text-left space-y-1">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">FIELD OPERATIONS</h1>
                <p className="text-sky-600 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Doorstep Pickup Queue
                </p>
            </div>

            {/* Job List */}
            <div className="grid grid-cols-1 gap-6">
                {pendingPickups.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[40px] py-20 text-center space-y-4">
                        <PackageOpen className="w-16 h-16 text-slate-200 mx-auto" />
                        <h3 className="text-xl font-bold text-slate-400">All Pickups Completed</h3>
                    </div>
                ) : (
                    pendingPickups.map(job => (
                        <div key={job.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl hover:border-sky-500/50 transition-all duration-300">
                            <div className="p-8 space-y-6">
                                {/* Device & Citizen Info */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-100 dark:border-sky-500/20">
                                            <Smartphone className="w-8 h-8 text-sky-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{job.model}</h2>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{job.brand}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black bg-sky-500/10 text-sky-600 px-3 py-1 rounded-full uppercase tracking-widest">Diagnostic Pickup</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                        <MapPin className="w-5 h-5 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight mt-1">{job.pickup_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                        <Phone className="w-5 h-5 text-slate-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Identity</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight mt-1">{job.citizen_name}</p>
                                            <p className="text-[10px] text-slate-500">{job.citizen_email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Section */}
                                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-600" />
                                            <input
                                                type="text"
                                                placeholder="Enter DUC Code from Citizen"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:border-sky-500 outline-none transition-all shadow-inner uppercase font-mono"
                                                value={selectedJob === job.id ? pickupCode : ''}
                                                onChange={e => {
                                                    setSelectedJob(job.id);
                                                    setPickupCode(e.target.value);
                                                }}
                                            />
                                        </div>
                                        <Button
                                            disabled={isVerifyingPickup}
                                            onClick={() => verifyPickup({ deviceId: job.device_id, pickupCode })}
                                            className="h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl px-10 font-black shadow-xl shadow-sky-900/40 transition-transform active:scale-95"
                                        >
                                            {isVerifyingPickup ? <Loader2 className="animate-spin w-5 h-5" /> : 'VERIFY DUC'}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 mt-4 italic">Device must be physically inspected before verification.</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {/* In Transit Section */}
                {inTransit.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 px-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tighter">In Transit to Facility</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inTransit.map(job => (
                                <div key={job.id} className="bg-slate-900 border border-white/10 p-6 rounded-[32px] space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white/5 rounded-2xl">
                                            <Smartphone className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{job.model}</h3>
                                            <p className="text-[10px] text-slate-500 uppercase font-black">{job.brand}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Pass this Code to Facility</p>
                                        <p className="text-xl font-black text-purple-400 font-mono tracking-widest">{job.refurb_pickup_code}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
