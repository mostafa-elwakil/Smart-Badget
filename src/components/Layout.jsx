import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

import InstallPWA from './InstallPWA';

export function Layout() {
    return (
        <div className="flex min-h-screen bg-secondary-50 dark:bg-secondary-950 transition-colors duration-300">
            <Sidebar />
            <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
                <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                    <Outlet />
                </div>
            </main>
            <BottomNav />
            <InstallPWA />
        </div>
    );
}
