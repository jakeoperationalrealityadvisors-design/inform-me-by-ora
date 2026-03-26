import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings, Building, Bell, LogOut, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '../components/theme/ThemeToggle';

export default function AdminSettings() {
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
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 text-sm mt-1">Manage your account and app preferences.</p>
            </div>

            {/* Profile */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Building className="w-4 h-4 text-orange-400" /> Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-slate-400 text-xs mb-1 block">Display Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                    <div>
                        <label className="text-slate-400 text-xs mb-1 block">Email</label>
                        <Input value={user?.email || ''} disabled className="bg-slate-700/50 border-slate-600 text-slate-400" />
                    </div>
                    <Button onClick={save} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                        <Save className="w-4 h-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-orange-400" /> Appearance</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white text-sm">Theme</p>
                        <p className="text-slate-400 text-xs">Switch between light, dark, and system</p>
                    </div>
                    <ThemeToggle showLabel />
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-orange-400" /> Notifications</h2>
                {[
                    { label: 'Task completions', desc: 'Notify when a user completes a task' },
                    { label: 'New uploads', desc: 'Notify when a user sends a scan' },
                    { label: 'New messages', desc: 'Notify when you receive a message' },
                ].map(({ label, desc }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                        <div>
                            <p className="text-white text-sm">{label}</p>
                            <p className="text-slate-400 text-xs">{desc}</p>
                        </div>
                        <div className="relative">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-10 h-6 bg-slate-600 peer-checked:bg-orange-500 rounded-full transition-colors cursor-pointer" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Account */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4">Account</h2>
                <Button onClick={logout} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                </Button>
            </div>
        </div>
    );
}