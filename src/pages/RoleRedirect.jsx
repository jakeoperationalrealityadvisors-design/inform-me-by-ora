import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function RoleRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        base44.auth.me().then(user => {
            if (user?.role === 'admin') {
                navigate('/AdminDashboard', { replace: true });
            } else {
                navigate('/UserHome', { replace: true });
            }
        }).catch(() => {
            navigate('/UserHome', { replace: true });
        });
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
                <span className="text-slate-400 text-sm">Loading...</span>
            </div>
        </div>
    );
}