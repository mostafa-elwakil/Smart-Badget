import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, TrendingUp, ShoppingCart, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dash', path: '/' },
    { icon: Wallet, label: 'Exp', path: '/expenses' },
    { icon: TrendingUp, label: 'Inc', path: '/income' },
    { icon: ShoppingCart, label: 'Shop', path: '/shopping' },
    { icon: PieChart, label: 'Sum', path: '/summary' },
];

export function BottomNav() {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 z-50 pb-safe dark:bg-secondary-800 dark:border-secondary-700">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive
                                    ? "text-primary-600 dark:text-primary-400"
                                    : "text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-50"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
