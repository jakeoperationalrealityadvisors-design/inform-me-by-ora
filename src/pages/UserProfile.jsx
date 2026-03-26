import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { LogOut, User, Building, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        base44.auth.me().then(u => {
            setUser(u);
            setName(u?.full_name || '');
        });
    }, []);

    const save = async () => {
        setSaving(true);
        await base44.auth.updateMe({ full_name: name });
        setSaved(true);
        setSaving(false);
        setTimeout(() => setSaved(false), 2000);
    };

    const logout = () => base44.auth.logout('/');

    return (
        <div className="space-y-5 max-w-sm mx-auto">
            {/* Avatar */}
            <div className="flex flex-col items-center pt-4 pb-2">
                <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center mb-3">
                    <span className="text-orange-400 font-black text-3xl">{(name || user?.email || 'U')[0].toUpperCase()}</span>
                </div>
                <p className="text-white text-xl font-bold">{name || user?.full_name || 'User'}</p>
                <p className="text-slate-400 text-sm">{user?.email}</p>
                <span className="mt-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">Field Worker</span>
            </div>

            {/* Profile form */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-400" /> Profile
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-slate-400 text-xs mb-1 block">Display Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                    <div>
                        <label className="text-slate-400 text-xs mb-1 block">Email</label>
                        <Input value={user?.email || ''} disabled className="bg-slate-700/50 border-slate-600 text-slate-400" />
                    </div>
                    <Button onClick={save} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2">
                        <Save className="w-4 h-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Company info */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-orange-400" /> Company
                </h2>
                <p className="text-slate-400 text-sm">Inform' Me by ORA</p>
                <p className="text-slate-500 text-xs mt-1">Field Operations Platform</p>
            </div>

            {/* Logout */}
            <Button onClick={logout} variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
            </Button>
        </div>
    );
}