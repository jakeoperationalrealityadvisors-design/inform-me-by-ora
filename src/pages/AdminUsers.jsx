import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Plus, Mail, Shield, UserX, Search, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [hopCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());

    const load = () => {
        base44.entities.User.list().then(u => {
            setUsers(u);
            setLoading(false);
        });
    };

    useEffect(() => { load(); }, []);

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setInviting(true);
        await base44.users.inviteUser(inviteEmail.trim(), 'user');
        setInviteEmail('');
        setShowInvite(false);
        setInviting(false);
        load();
    };

    const copyHopCode = () => {
        navigator.clipboard.writeText(hopCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filtered = users.filter(u =>
        (u.full_name || u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const fieldUsers = filtered.filter(u => u.role !== 'admin');
    const adminUsers = filtered.filter(u => u.role === 'admin');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Users</h1>
                    <p className="text-slate-400 text-sm mt-1">{users.length} total members</p>
                </div>
                <Button onClick={() => setShowInvite(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    <Plus className="w-4 h-4" /> Add User
                </Button>
            </div>

            {/* Hop Code Card */}
            <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-xl p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-orange-400 font-semibold text-sm mb-1">Company Hop Code</p>
                        <p className="text-white text-3xl font-black tracking-wider">{hopCode}</p>
                        <p className="text-slate-400 text-xs mt-1">Share this code with field workers to join instantly</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={copyHopCode} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors">
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button onClick={load} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInvite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-white font-semibold text-lg mb-1">Invite User</h3>
                        <p className="text-slate-400 text-sm mb-4">Send an email invitation to join the team.</p>
                        <Input
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder="Email address"
                            type="email"
                            className="bg-slate-700 border-slate-600 text-white mb-4"
                            onKeyDown={e => e.key === 'Enter' && handleInvite()}
                        />
                        <div className="flex gap-3">
                            <Button onClick={() => setShowInvite(false)} variant="outline" className="flex-1 border-slate-600 text-slate-300">Cancel</Button>
                            <Button onClick={handleInvite} disabled={inviting} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                                {inviting ? 'Inviting...' : 'Send Invite'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="pl-9 bg-slate-800 border-slate-700 text-white" />
            </div>

            {/* User Lists */}
            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Field Users */}
                    <div>
                        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Field Workers ({fieldUsers.length})</h2>
                        {fieldUsers.length === 0 ? (
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
                                <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-400 text-sm">No field workers yet. Share the hop code or invite via email.</p>
                            </div>
                        ) : (
                            <div className="bg-slate-800 border border-slate-700 rounded-xl divide-y divide-slate-700">
                                {fieldUsers.map(u => (
                                    <div key={u.id} className="flex items-center gap-4 p-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-blue-400 font-bold text-sm">{(u.full_name || u.email || 'U')[0].toUpperCase()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm">{u.full_name || '—'}</p>
                                            <p className="text-slate-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-slate-400 text-xs">Active</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Admins */}
                    {adminUsers.length > 0 && (
                        <div>
                            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Admins ({adminUsers.length})</h2>
                            <div className="bg-slate-800 border border-slate-700 rounded-xl divide-y divide-slate-700">
                                {adminUsers.map(u => (
                                    <div key={u.id} className="flex items-center gap-4 p-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-orange-400 font-bold text-sm">{(u.full_name || u.email || 'A')[0].toUpperCase()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium text-sm">{u.full_name || '—'}</p>
                                            <p className="text-slate-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                                        </div>
                                        <span className="flex items-center gap-1 text-orange-400 text-xs"><Shield className="w-3 h-3" /> Admin</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}