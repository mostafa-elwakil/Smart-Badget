import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, ShoppingCart, PieChart, Settings, LogOut, Tags, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';

export function Sidebar() {
    const { t } = useLanguage();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const navItems = [
        { icon: LayoutDashboard, label: t('dashboard'), path: '/' },
        { icon: Wallet, label: t('expenses'), path: '/expenses' },
        { icon: TrendingUp, label: t('income'), path: '/income' },
        { icon: ShoppingCart, label: t('shopping'), path: '/shopping' },
        { icon: PieChart, label: t('summary'), path: '/summary' },
        { icon: Tags, label: t('categories'), path: '/categories' },
        { icon: Users, label: t('users'), path: '/users', role: 'Admin' },
        { icon: Settings, label: t('settings'), path: '/settings' },
    ];

    const filteredNavItems = navItems.filter(item => {
        if (item.role === 'Admin') {
            return user.role === 'Admin';
        }
        return true;
    });

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-secondary-200 h-screen sticky top-0 dark:bg-secondary-800 dark:border-secondary-700">
            <div className="p-6 border-b border-secondary-100 dark:border-secondary-700">
                <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
                    <Wallet className="h-8 w-8" />
                    BudgetApp
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary-50 text-primary-700 font-medium dark:bg-primary-900/20 dark:text-primary-400"
                                    : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-700 dark:hover:text-secondary-50"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-secondary-100 dark:border-secondary-700">
                <button
                    onClick={() => api.logout()}
                    className="flex items-center gap-3 px-4 py-3 w-full text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 rounded-lg transition-colors dark:text-secondary-400 dark:hover:bg-secondary-700 dark:hover:text-secondary-50"
                >
                    <LogOut className="h-5 w-5" />
                    {t('logout')}
                </button>
            </div>
        </aside>
    );
}
