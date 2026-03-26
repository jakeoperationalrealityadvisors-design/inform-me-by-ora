import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AdminLayout from './AdminLayout';
import UserLayout from './UserLayout';

export default function RoleRouter({ children, currentPageName }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        base44.auth.me().then(u => {
            setUser(u);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-slate-400 text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    const isAdmin = user?.role === 'admin';

    if (isAdmin) {
        return <AdminLayout currentPageName={currentPageName} user={user}>{children}</AdminLayout>;
    }

    return <UserLayout currentPageName={currentPageName} user={user}>{children}</UserLayout>;
}