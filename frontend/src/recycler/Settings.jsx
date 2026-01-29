import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldCheck, Mail, Settings, Lock, Factory, Camera, AlertTriangle, Loader2, Edit2, Check, X, Unlock } from 'lucide-react';
import api from '../api/axios';

export default function RecyclerSettings() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // States for editing individual fields
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingLicense, setIsEditingLicense] = useState(false);

    const [formData, setFormData] = useState({
        displayName: user?.full_name || user?.displayName || '',
        organization: user?.organization || '',
        email: user?.email || '',
        avatar_url: user?.avatar_url || '',
        status: user?.status || 'operational'
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setFetching(true);
            try {
                const res = await api.get('/profile');
                const data = res.data;

                // If license is missing, try to "fetch" it from other recycler accounts with same name (system fallback)
                let license = data.organization;
                if (!license) {
                    try {
                        // Heuristic: Find any recycler with this name that might have a license
                        const allRecyclers = await api.get('/recycling/dashboard');
                        // Actually dashboard only returns data. Let's try to find an endpoint.
                        // For now, let's just stick to the profile data.
                    } catch (e) { }
                }

                const updated = {
                    displayName: data.displayName || '',
                    organization: license || '',
                    email: data.email || '',
                    avatar_url: data.avatar_url || ''
                };
                setFormData(updated);

                // Update context to stay in sync
                updateUser({
                    full_name: data.displayName,
                    organization: license,
                    avatar_url: data.avatar_url,
                    email: data.email
                });
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSaveField = async (field) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/profile/update', formData);
            const updated = res.data;
            updateUser({
                full_name: updated.displayName,
                organization: updated.organization,
                avatar_url: updated.avatar_url,
                email: updated.email
            });
            setSuccess(true);
            // Close the specific editor
            if (field === 'name') setIsEditingName(false);
            if (field === 'email') setIsEditingEmail(false);
            if (field === 'license') setIsEditingLicense(false);

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar_url: reader.result }));
                // Auto-save avatar
                saveAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveAvatar = async (url) => {
        try {
            await api.post('/profile/update', { avatar_url: url });
            updateUser({ avatar_url: url });
        } catch (e) {
            console.error('Failed to save avatar', e);
        }
    };

    const toggleStatus = () => {
        const newStatus = formData.status === 'operational' ? 'unoperational' : 'operational';
        setFormData(prev => ({ ...prev, status: newStatus }));
        // Update global user context immediately for UI responsiveness
        updateUser({
            ...user,
            status: newStatus
        });

        // Optionally save to backend if endpoint exists
        // api.post('/profile/update-status', { status: newStatus }).catch(console.error);
    };



    if (fetching) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="animate-spin text-orange-500" size={32} />
            <span className="text-xs font-bold uppercase tracking-widest">Synchronizing Profile...</span>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-xl">
                        <Settings className="w-8 h-8 text-orange-500" />
                    </div>
                    Profile Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 ml-14">
                    Manage your authorized facility credentials and professional identity.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-8 pb-24 flex flex-col items-center text-center backdrop-blur-sm sticky top-8 shadow-sm dark:shadow-2xl relative">

                        {/* Profile Image with Edit Overlay */}
                        <div className="relative group cursor-pointer mb-6" onClick={() => document.getElementById('avatar-upload').click()}>
                            <div className="w-32 h-32 rounded-3xl bg-orange-500/10 border-2 border-orange-500/20 flex items-center justify-center overflow-hidden shadow-lg shadow-orange-500/10 group-hover:border-orange-500/50 transition-all">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Factory className="w-16 h-16 text-orange-500" />
                                )}
                            </div>

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-white flex items-center gap-1">
                                    <Camera size={14} /> Change
                                </span>
                            </div>

                            <input
                                type="file"
                                id="avatar-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{formData.displayName || 'Authorized Facility'}</h2>

                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Official Recycler</span>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">Verified Since</span>
                                <span className="text-slate-700 dark:text-white font-mono font-bold">JAN 2026</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">Authorization ID</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{formData.organization ? 'VALID' : 'PENDING'}</span>
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div className="absolute bottom-4 left-4">
                            <button
                                onClick={toggleStatus}
                                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all duration-300 ${formData.status === 'operational'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${formData.status === 'operational' ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'}`}>
                                    {formData.status === 'operational' ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none">Status</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wide leading-none">{formData.status}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-sm dark:shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Facility Profile Details
                            </h3>
                            {success && (
                                <span className="text-[10px] text-emerald-500 font-bold animate-in fade-in slide-in-from-right-2 uppercase flex items-center gap-1">
                                    <Check size={12} /> Saved Successfully
                                </span>
                            )}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-3">
                                <AlertTriangle size={16} />
                                <span className="font-bold uppercase tracking-tight">{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Facility Name */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Building2 size={12} /> Facility Name
                                    </label>
                                    <button
                                        onClick={() => isEditingName ? handleSaveField('name') : setIsEditingName(true)}
                                        disabled={loading}
                                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        {loading && isEditingName ? <Loader2 size={12} className="animate-spin" /> : (isEditingName ? <Check size={12} /> : <Edit2 size={12} />)}
                                        {isEditingName ? 'SAVE' : 'EDIT'}
                                    </button>
                                </div>
                                <div className={`relative group transition-all duration-300 ${isEditingName ? 'scale-105' : ''}`}>
                                    <input
                                        type="text"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                        disabled={!isEditingName}
                                        className={`w-full bg-slate-50 dark:bg-black/40 border rounded-2xl py-4 px-5 text-slate-900 dark:text-white font-medium outline-none transition-all ${isEditingName ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white dark:bg-black/60 shadow-lg shadow-orange-500/5' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50'}`}
                                    />
                                </div>
                            </div>

                            {/* Official Email */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Mail size={12} /> Official Email
                                    </label>
                                    <button
                                        onClick={() => isEditingEmail ? handleSaveField('email') : setIsEditingEmail(true)}
                                        disabled={loading}
                                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        {loading && isEditingEmail ? <Loader2 size={12} className="animate-spin" /> : (isEditingEmail ? <Check size={12} /> : <Edit2 size={12} />)}
                                        {isEditingEmail ? 'SAVE' : 'EDIT'}
                                    </button>
                                </div>
                                <div className={`relative group transition-all duration-300 ${isEditingEmail ? 'scale-105' : ''}`}>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditingEmail}
                                        className={`w-full bg-slate-50 dark:bg-black/40 border rounded-2xl py-4 px-5 text-slate-900 dark:text-white font-medium outline-none transition-all ${isEditingEmail ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white dark:bg-black/60 shadow-lg shadow-orange-500/5' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50'}`}
                                    />
                                </div>
                            </div>

                            {/* License Number */}
                            <div className="space-y-3 md:col-span-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <ShieldCheck size={12} /> Facility License Number
                                    </label>
                                    <button
                                        onClick={() => isEditingLicense ? handleSaveField('license') : setIsEditingLicense(true)}
                                        disabled={loading}
                                        className="text-[10px] font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        {loading && isEditingLicense ? <Loader2 size={12} className="animate-spin" /> : (isEditingLicense ? <Check size={12} /> : <Edit2 size={12} />)}
                                        {isEditingLicense ? 'SAVE' : 'EDIT'}
                                    </button>
                                </div>
                                <div className={`relative group transition-all duration-300 ${isEditingLicense ? 'scale-105' : ''}`}>
                                    <input
                                        type="text"
                                        value={formData.organization}
                                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                        disabled={!isEditingLicense}
                                        placeholder="EP-VALID-XXXX"
                                        className={`w-full bg-slate-50 dark:bg-black/40 border rounded-2xl py-4 px-5 text-slate-900 dark:text-white font-medium outline-none transition-all ${isEditingLicense ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white dark:bg-black/60 shadow-lg shadow-orange-500/5' : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5">
                            <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                    <Lock size={20} className="text-orange-500" />
                                </div>
                                <p className="text-xs text-orange-600 dark:text-orange-200/60 font-medium leading-relaxed">
                                    Click on any 'EDIT' button to unlock sensitive credentials for modification. Changes are logged for audit purposes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 animate-pulse">
                            <AlertTriangle className="text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <div className="text-center md:text-left">
                            <h4 className="text-sm font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-1">Bureau of Indian Standards Warning</h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-200/60 leading-relaxed max-w-2xl">
                                Unauthorized changes to facility portal credentials may result in immediate suspension of access and legal action under the E-Waste Management Rules, 2024.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
