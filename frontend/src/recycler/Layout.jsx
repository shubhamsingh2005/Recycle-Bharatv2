import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Factory, LogOut, Settings, Inbox, Truck, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export default function RecyclerLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const navItems = [
        { label: 'Incoming Requests', icon: Inbox, path: '/recycler/dashboard' },
        { label: 'Logistics Partners', icon: Truck, path: '/recycler/assignments' },
        { label: 'Processing History', icon: History, path: '/recycler/history' },
        { label: 'Facility Settings', icon: Settings, path: '/recycler/settings' },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Factory className="w-5 h-5 text-orange-400" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user?.full_name || 'Recycling Center'}</h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.organization || 'Authorized Facility #402'}</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                location.pathname === item.path
                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-white/10">
                    <div className="px-3 py-2 text-xs text-muted-foreground mb-1 flex items-center gap-2">
                        Status:
                        <span className={cn(
                            "font-medium uppercase tracking-wider",
                            user?.status === 'unoperational' ? "text-slate-500" : "text-emerald-500"
                        )}>
                            {user?.status || 'Operational'}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-destructive/80 hover:text-destructive transition-colors w-full"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative bg-slate-50 dark:bg-slate-950 dark:bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] dark:from-orange-900/10 dark:via-slate-950 dark:to-slate-950">
                {/* Mobile Header */}
                <header className="h-16 border-b border-border flex items-center px-4 md:hidden bg-background/80 backdrop-blur-md sticky top-0 z-10">
                    <span className="font-bold text-orange-400">Recycler Portal</span>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
