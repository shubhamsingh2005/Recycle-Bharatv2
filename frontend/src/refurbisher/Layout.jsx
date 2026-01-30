import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { RefreshCw, Package, Settings, LogOut, LayoutDashboard, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

export default function RefurbisherLayout() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = user?.role === 'REFURBISHER_AGENT'
        ? [{ label: 'Field Assignments', icon: Truck, path: '/refurbisher-agent/dashboard' }]
        : [
            { label: 'Diagnostic Queue', icon: LayoutDashboard, path: '/refurbisher/dashboard' },
            { label: 'In Repair', icon: RefreshCw, path: '/refurbisher/in-repair' },
            { label: 'Settings', icon: Settings, path: '/refurbisher/settings' },
        ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 p-6 flex flex-col gap-8 z-30">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
                        <RefreshCw className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Bharat</span>
                        <span className="text-xl font-black text-blue-600 tracking-tighter">REFURB</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20'
                                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-slate-100 dark:border-white/5 pt-6 space-y-4">
                    <div className="flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-600 uppercase">
                            {user?.full_name?.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.full_name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user?.role}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start gap-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 font-bold"
                    >
                        <LogOut className="w-5 h-5" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
