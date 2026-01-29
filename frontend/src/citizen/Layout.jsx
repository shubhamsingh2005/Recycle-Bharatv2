import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, History, Award, LogOut, User, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import logo from '../applogo.png';

export default function CitizenLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { logout } = useAuth();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const navItems = [
        { label: t.myDevices, icon: Package, path: '/citizen/dashboard' },
        { label: t.rewards, icon: Award, path: '/citizen/rewards' },
        { label: t.activity, icon: History, path: '/citizen/activity' },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Recycle Bharat" className="h-8 w-auto object-contain" />
                        <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">
                            Recycle Bharat
                        </h2>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                                location.pathname === item.path
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <Link to="/citizen/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
                        <User className="w-4 h-4" /> {t.profile}
                    </Link>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors w-full font-medium"
                    >
                        <LogOut className="w-4 h-4" /> {t.signOut || "Sign Out"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative bg-slate-50 dark:bg-slate-950">
                {/* Mobile Header (Hidden on Desktop) */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 md:hidden bg-white dark:bg-slate-950 sticky top-0 z-10">
                    <span className="font-bold">Recycle Bharat</span>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
