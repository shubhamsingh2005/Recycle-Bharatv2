import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecycler } from '../hooks/useRecycler';
import { Loader2, Truck, UserCheck, CheckCircle2, X, Recycle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const RecyclerDashboard = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();
    const {
        requests, deliveries, inventory, collectors, assigned, recovered,
        isLoading, error, assignCollector, isAssigning,
        confirmDelivery, isDelivering, markRecycled, isRecycling
    } = useRecycler();

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent italic tracking-tight">
                        FACILITY COMMAND
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-1 ml-1">
                        Operational Control Center • Recycle Bharat
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    {/* Theme Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all text-orange-500"
                    >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10 mx-1" />
                    <div className="px-3 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-[10px] font-black tracking-widest uppercase border border-orange-500/20">
                        {collectors.length} PARTNERS ONLINE
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-sm flex items-center gap-3">
                    <div className="w-1 h-6 bg-red-500 rounded-full" />
                    {error.response?.data?.message || error.response?.data?.error || error.message}
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatMetric label="Incoming" value={requests?.length} color="blue" icon={Truck} />
                <StatMetric label="Transiting" value={deliveries?.length} color="orange" icon={Truck} />
                <StatMetric label="In Facility" value={inventory?.length} color="emerald" icon={CheckCircle2} />
                <StatMetric label="Dispatched" value={assigned?.length} color="blue" icon={Truck} />
                <StatMetric label="Recovered" value={recovered?.length} color="teal" icon={Recycle} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Action Column */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Incoming Requests */}
                    <DashboardSection
                        title="Incoming Requests"
                        icon={<Truck className="text-blue-500" />}
                        subtitle="New device admission requests waiting for logistics assignment."
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                                    <tr>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Identity</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Owner</th>
                                        <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {requests?.length === 0 ? (
                                        <EmptyState icon={<Truck size={32} />} text="No pending requests" />
                                    ) : (
                                        requests?.map((req) => (
                                            <RequestRow
                                                key={req._id}
                                                req={req}
                                                collectors={collectors}
                                                onAssign={assignCollector}
                                                isAssigning={isAssigning}
                                                navigate={navigate}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </DashboardSection>

                    {/* Active Dispatches Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Active Dispatches */}
                        <DashboardSection
                            title="Active Dispatches"
                            icon={<Truck size={18} className="text-blue-400" />}
                            subtitle="Awaiting pickup from citizen."
                        >
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {assigned?.length === 0 ? (
                                            <EmptyState mini text="No active dispatches" />
                                        ) : (
                                            assigned.map((dev) => (
                                                <tr key={dev._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-slate-900 dark:text-white text-xs">{dev.model}</div>
                                                        <div className="text-[9px] font-mono text-slate-400">{dev.uid}</div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 uppercase tracking-widest">
                                                            Awaiting
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </DashboardSection>

                        {/* Inbound Logistics */}
                        <DashboardSection
                            title="Inbound Logistics"
                            icon={<Truck size={18} className="text-orange-400" />}
                            subtitle="Partners in transit to facility."
                        >
                            <div className="max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                        {(deliveries || []).length === 0 ? (
                                            <EmptyState mini text="No inbound logistics" />
                                        ) : (
                                            deliveries.map((dev) => (
                                                <DeliveryRow
                                                    key={dev._id}
                                                    dev={dev}
                                                    onConfirm={confirmDelivery}
                                                    isDelivering={isDelivering}
                                                    mini
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </DashboardSection>
                    </div>
                </div>

                {/* Right Side Strategy Column */}
                <div className="space-y-8">
                    {/* Materials at Facility */}
                    <DashboardSection
                        title="At Facility"
                        icon={<CheckCircle2 className="text-emerald-500" />}
                        subtitle="Awaiting final recycling."
                    >
                        <div className="space-y-4 p-2">
                            {inventory?.length === 0 ? (
                                <EmptyState mini text="Inventory clear" />
                            ) : (
                                inventory.map((dev) => (
                                    <InventoryCard key={dev._id} dev={dev} onRecycle={markRecycled} isRecycling={isRecycling} />
                                ))
                            )}
                        </div>
                    </DashboardSection>

                    {/* Recycling Ledger */}
                    <DashboardSection
                        title="Recycling Ledger"
                        icon={<Recycle className="text-teal-500" />}
                        subtitle="Recent proven outcomes."
                    >
                        <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {(recovered || []).length === 0 ? (
                                        <EmptyState mini text="Ledger empty" />
                                    ) : (
                                        recovered.map((r) => (
                                            <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4">
                                                    <div className="font-mono text-[10px] text-slate-400">{r.uid}</div>
                                                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-0.5">{r.outcome}</div>
                                                </td>
                                                <td className="p-4 text-right text-[10px] text-slate-400 font-bold">
                                                    {new Date(r.recycledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </DashboardSection>
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const DashboardSection = ({ title, icon, subtitle, children }) => (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm dark:shadow-2xl backdrop-blur-sm">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
            <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    {icon} {title}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subtitle}</p>
            </div>
        </div>
        <div>{children}</div>
    </div>
);

const StatMetric = ({ label, value, color, icon: Icon }) => {
    const colors = {
        blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        teal: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    };
    return (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-sm hover:scale-[1.02] transition-transform">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border mb-3 ${colors[color]}`}>
                <Icon size={16} />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{value || 0}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</div>
        </div>
    );
};

const EmptyState = ({ text, icon, mini }) => (
    <div className={`text-center ${mini ? 'p-8' : 'p-20'} text-slate-400 dark:text-slate-600`}>
        {icon && <div className="mb-4 opacity-20 flex justify-center">{icon}</div>}
        <p className="text-xs font-bold uppercase tracking-widest italic">{text}</p>
    </div>
);

const InventoryCard = ({ dev, onRecycle, isRecycling }) => {
    const [material, setMaterial] = useState('');
    const [isPrompted, setIsPrompted] = useState(false);

    if (isPrompted) {
        return (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-in zoom-in-95 duration-200">
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">Specify Output Content</label>
                <input
                    type="text"
                    placeholder="e.g. Copper, Plastic..."
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-white dark:bg-black/40 border border-emerald-500/30 text-xs p-2 rounded-lg outline-none mb-3"
                    autoFocus
                />
                <div className="flex gap-2">
                    <button onClick={() => setIsPrompted(false)} className="flex-1 text-[10px] font-bold text-slate-500 py-1">CANCEL</button>
                    <button
                        onClick={() => onRecycle({ deviceId: dev._id, proofMetadata: { recovered_material: material } })}
                        className="flex-1 bg-emerald-600 text-white text-[10px] font-black py-1 rounded-lg"
                        disabled={!material || isRecycling}
                    >
                        {isRecycling ? 'SAVING...' : 'FINALIZE'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl flex items-center justify-between group">
            <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white uppercase truncate max-w-[120px]">{dev.model}</div>
                <div className="text-[9px] font-mono text-slate-400">{dev.uid}</div>
            </div>
            <button
                onClick={() => setIsPrompted(true)}
                className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
            >
                <Recycle size={14} />
            </button>
        </div>
    );
};

const RequestRow = ({ req, collectors, onAssign, isAssigning, navigate }) => {
    const [selectedCollector, setSelectedCollector] = useState('');

    const handleAssign = () => {
        if (!selectedCollector) return alert('Please select a collector first.');
        // Fixed: Pass 'requestId' (not deviceId) and 'scheduledTime' to match useRecycler signature
        onAssign({
            requestId: req._id,
            collectorId: selectedCollector,
            scheduledTime: new Date().toISOString() // Default to immediate dispatch
        });
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
            <td className="p-4">
                <div className="font-medium text-slate-900 dark:text-white">{req.model}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 select-all">{req.uid}</div>
            </td>
            <td className="p-4">
                <div className="text-sm text-slate-600 dark:text-slate-300">{req.ownerId?.email || 'N/A'}</div>
                {req.source === 'Refurbisher Request' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-500/10 text-purple-600 border border-purple-500/20 uppercase tracking-widest">
                        REFURB HANDOVER
                    </span>
                ) : (
                    <div className="text-[10px] text-slate-500">Citizen Account</div>
                )}
            </td>
            <td className="p-4">
                <div className="text-sm text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</div>
                <div className="text-[10px] text-slate-500">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </td>
            <td className="p-4">
                <div className="flex justify-end items-center gap-2">
                    <select
                        value={selectedCollector}
                        onChange={(e) => setSelectedCollector(e.target.value)}
                        className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-white/10 text-xs text-slate-700 dark:text-white rounded-lg px-3 py-2 w-48 focus:border-orange-500/50 outline-none transition-all shadow-sm"
                    >
                        <option value="">Select Logistics Partner...</option>
                        {collectors.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.displayName || c.email} {c.organization ? `(${c.organization})` : ''}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedCollector || isAssigning}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-lg transition-all text-xs font-bold"
                    >
                        {isAssigning ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                        Dispatch Partner
                    </button>
                </div>
            </td>
        </tr>
    );
};

const DeliveryRow = ({ dev, onConfirm, isDelivering, mini }) => {
    const [duc, setDuc] = useState('');
    const [isPrompted, setIsPrompted] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        if (duc.length !== 6) return setError('DUC must be 6 digits');
        setError('');
        try {
            await onConfirm({ deviceId: dev._id, duc });
        } catch (err) {
            setError(err.response?.data?.error || 'Handover failed: Check DUC');
        }
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
            <td className="p-4">
                <div className="font-bold text-slate-900 dark:text-white group-hover:text-orange-400 transition-colors text-xs">{dev.model}</div>
                <div className="text-[9px] font-mono text-slate-400 uppercase">{dev.uid}</div>
            </td>
            {!mini && (
                <td className="p-4">
                    <div className="text-sm text-slate-600 dark:text-slate-300 font-bold">{dev.collectorId?.displayName}</div>
                    <div className="text-[10px] text-slate-500">{dev.collectorId?.email}</div>
                </td>
            )}
            <td className="p-4 text-right">
                <div className="flex justify-end items-center gap-2">
                    {isPrompted ? (
                        <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
                            <input
                                type="text"
                                maxLength={6}
                                value={duc}
                                onChange={(e) => setDuc(e.target.value.replace(/\D/g, ''))}
                                placeholder="DUC"
                                className="bg-slate-50 dark:bg-slate-950 border border-orange-500/30 text-[10px] font-black tracking-widest text-orange-600 dark:text-orange-400 rounded-lg px-2 py-1.5 w-20 focus:border-orange-500 outline-none transition-all"
                                autoFocus
                            />
                            <button
                                onClick={handleConfirm}
                                disabled={isDelivering || duc.length !== 6}
                                className="bg-orange-600 hover:bg-orange-500 text-white p-1.5 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-orange-900/20"
                            >
                                {isDelivering ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            </button>
                            <button onClick={() => setIsPrompted(false)} className="text-slate-500 hover:text-white p-1">
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsPrompted(true)}
                            className="inline-flex items-center gap-2 px-2 py-1 bg-orange-500/10 hover:bg-orange-500 text-orange-600 dark:text-orange-400 hover:text-white rounded-lg text-[10px] font-black transition-all border border-orange-500/10"
                        >
                            ACCEPT
                        </button>
                    )}
                </div>
                {error && <p className="text-[8px] text-red-500 text-right mt-1 font-bold">{error}</p>}
            </td>
        </tr>
    );
};



export default RecyclerDashboard;
