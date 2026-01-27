import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Recycle, Truck, Factory, Building2, User, ChevronDown, Leaf } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

// Import carousel images
import img1 from '@/images/1.png';
import img2 from '@/images/2.png';
import img3 from '@/images/3.png';
import img4 from '@/images/4.png';
import img5 from '@/images/5.png';
import appLogo from '@/applogo.png';

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role') || 'citizen';

    const { login } = useAuth();
    const [role, setRole] = useState(initialRole);
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Carousel state
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselImages = [img1, img2, img3, img4, img5];

    // Auto-rotate carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(formData.identifier, formData.password);
            const userRole = user.role.toLowerCase();
            if (userRole !== role && role !== 'government') {
                setError(`Access denied. Your account is registered as a ${user.role}, but you are trying to log in as a ${role}.`);
                setIsLoading(false);
                return;
            }
            navigate(`/${userRole}/dashboard`);
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        { id: 'citizen', label: 'Citizen', icon: User, color: 'text-emerald-400' },
        { id: 'collector', label: 'Collector', icon: Truck, color: 'text-blue-400' },
        { id: 'recycler', label: 'Recycler', icon: Factory, color: 'text-orange-400' },
        { id: 'government', label: 'Official', icon: Building2, color: 'text-purple-400' },
    ];

    const CurrentIcon = roles.find(r => r.id === role)?.icon || User;

    const getRegisterPath = () => {
        if (role === 'citizen') return '/register';
        if (role === 'recycler') return '/register/recycler';
        if (role === 'collector') return '/register/collector';
        return '/register';
    };

    const getRegisterLabel = () => {
        if (role === 'citizen') return 'Create Account';
        if (role === 'recycler') return 'Register Facility';
        if (role === 'collector') return 'Register Agent';
        return 'Create Account';
    };

    const scrollToLogin = () => {
        document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' });
    };

    const stats = [
        { value: '50K+', label: 'Devices Recycled', icon: Recycle },
        { value: '1200+', label: 'Active Citizens', icon: User },
        { value: '85%', label: 'Waste Diverted', icon: Leaf },
        { value: '25+', label: 'Recycling Centers', icon: Factory },
    ];

    const trendingServices = [
        'Register E-Waste Device',
        'Track Recycling Request',
        'Find Nearby Collection Center',
        'View Incentive Balance',
        'Download Recycling Certificate',
    ];

    return (
        <div className="min-h-screen overflow-y-auto scroll-smooth">
            {/* Government Header Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 via-white to-green-600 h-1" />

            {/* Hero Section - Full Screen */}
            <section className="min-h-screen relative flex items-center justify-center">
                {/* Background Carousel */}
                <div className="absolute inset-0 z-0">
                    {carouselImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/85" />
                        </div>
                    ))}
                </div>

                {/* Hero Content */}
                <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                    {/* Government Emblem */}
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 mb-8 shadow-2xl p-3">
                        <img src={appLogo} alt="Recycle Bharat Logo" className="w-full h-full object-contain" />
                    </div>

                    {/* Main Title */}
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl mb-4">
                        recycleBharat
                        <span className="inline-block ml-3 px-3 py-1 text-sm bg-yellow-500 text-black rounded-md font-semibold">BETA</span>
                    </h1>

                    <p className="text-2xl md:text-3xl text-white font-semibold mb-3 drop-shadow-lg">
                        National E-Waste Management Portal
                    </p>

                    <p className="text-lg text-slate-200 mb-12 drop-shadow">
                        Where Environmental Responsibility Converges
                    </p>

                    {/* Trending Services */}
                    <div className="mb-12">
                        <p className="text-white/90 mb-3 font-medium">Trending Services:</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {trendingServices.map((service, idx) => (
                                <button
                                    key={idx}
                                    className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 backdrop-blur-sm text-white rounded-lg text-sm transition-all border border-white/10"
                                >
                                    {service}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                                <stat.icon className="w-8 h-8 text-emerald-400 mb-3 mx-auto" />
                                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-200">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Scroll Down Indicator */}
                    <button
                        onClick={scrollToLogin}
                        className="inline-flex flex-col items-center gap-2 text-white/80 hover:text-white transition-all animate-bounce"
                    >
                        <span className="text-sm font-medium">Scroll to Login</span>
                        <ChevronDown className="w-6 h-6" />
                    </button>
                </div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {carouselImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* Login Section */}
            <section id="login-section" className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
                <div className="w-full max-w-md px-4">
                    {/* Login Card */}
                    <div className="bg-white/95 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Your Dashboard</h2>
                            <p className="text-slate-600 text-sm">Select your role and login to continue</p>
                        </div>

                        {/* Role Switcher */}
                        <div className="grid grid-cols-4 gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setRole(r.id)}
                                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 ${role === r.id
                                        ? 'bg-white shadow-md ring-2 ring-emerald-500/30'
                                        : 'hover:bg-white/50 text-slate-500'
                                        }`}
                                >
                                    <r.icon className={`w-5 h-5 mb-1 ${role === r.id ? r.color : 'text-slate-400'}`} />
                                    <span className={`text-[10px] font-medium ${role === r.id ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {r.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <CurrentIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        id="identifier"
                                        name="identifier"
                                        autoComplete="username"
                                        placeholder="user@example.com"
                                        className="pl-10 bg-slate-50 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        value={formData.identifier}
                                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                                        Forgot?
                                    </a>
                                </div>
                                <Input
                                    type="password"
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="bg-slate-50 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <Button
                                variant="premium"
                                className="w-full mt-6 h-11 text-base shadow-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-600">
                            New as a {role.charAt(0).toUpperCase() + role.slice(1)}?{' '}
                            <Link
                                to={getRegisterPath()}
                                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                            >
                                {getRegisterLabel()}
                            </Link>
                        </div>
                    </div>

                    {/* Government Footer */}
                    <div className="mt-8 text-center space-y-2">
                        <p className="text-xs text-slate-400 font-medium">
                            Secure • Transparent • Government Approved
                        </p>
                        <p className="text-[10px] text-slate-500">
                            © 2026 Ministry of Environment, Forest and Climate Change
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
