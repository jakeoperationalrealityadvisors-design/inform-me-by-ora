import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, AlertCircle, CheckCircle, XCircle, Clock, CreditCard, Users, TrendingUp, Rocket } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';

const STATUS_CONFIG = {
    active:         { color: 'bg-green-700', icon: CheckCircle, label: 'Active' },
    trialing:       { color: 'bg-blue-700',  icon: Clock,        label: 'Trialing' },
    trial:          { color: 'bg-slate-600', icon: Clock,        label: 'Free Trial' },
    past_due:       { color: 'bg-red-700',   icon: AlertCircle,  label: 'Past Due' },
    payment_failed: { color: 'bg-red-700',   icon: AlertCircle,  label: 'Payment Failed' },
    canceled:       { color: 'bg-slate-600', icon: XCircle,      label: 'Canceled' },
};

const PLAN_BADGE_COLOR = {
    trial:      'bg-slate-700 text-slate-300',
    launch_1:   'bg-green-800 text-green-200',
    launch_10:  'bg-teal-800 text-teal-200',
    basic:      'bg-blue-800 text-blue-200',
    pro:        'bg-orange-800 text-orange-200',
    enterprise: 'bg-purple-800 text-purple-200',
};

export default function AdminBilling() {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: () => base44.auth.me(),
    });

    const { data: subscriptions = [], isLoading } = useQuery({
        queryKey: ['all-subscriptions'],
        queryFn: () => base44.entities.UserSubscription.list('-created_date', 200),
        enabled: user?.role === 'admin',
    });

    const { data: launchCounts } = useQuery({
        queryKey: ['launch-counts'],
        queryFn: async () => {
            const active = subscriptions.filter(s => s.status === 'active');
            return {
                launch_1:  active.filter(s => s.plan_key === 'launch_1').length,
                launch_10: active.filter(s => s.plan_key === 'launch_10').length,
            };
        },
        enabled: subscriptions.length > 0,
    });

    if (user && user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <Card className="bg-[#0f1419] border-red-900/30 p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-white text-xl font-bold mb-2">Access Denied</h2>
                    <p className="text-blue-400">Admin access required to view billing data.</p>
                </Card>
            </div>
        );
    }

    const filtered = subscriptions.filter(sub => {
        const matchSearch = !search ||
            sub.user_email?.toLowerCase().includes(search.toLowerCase()) ||
            sub.user_name?.toLowerCase().includes(search.toLowerCase()) ||
            sub.plan_key?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || sub.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Summary metrics
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const pastDueCount = subscriptions.filter(s => s.status === 'past_due' || s.status === 'payment_failed').length;
    const canceledCount = subscriptions.filter(s => s.status === 'canceled').length;
    const launchTierCount = subscriptions.filter(s => s.is_launch_tier && s.status === 'active').length;

    const MRR = subscriptions
        .filter(s => s.status === 'active' && !s.is_launch_tier)
        .reduce((sum, s) => {
            const prices = { basic: 29, pro: 79, enterprise: 199 };
            return sum + (prices[s.plan_key] || 0);
        }, 0);

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/Admin">
                        <Button variant="ghost" size="icon" className="text-blue-400">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Billing Admin</h1>
                        <p className="text-sm text-blue-400">Subscription visibility for all users</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Active Paid', value: activeCount, icon: CheckCircle, color: 'text-green-400' },
                        { label: 'Past Due', value: pastDueCount, icon: AlertCircle, color: 'text-red-400' },
                        { label: 'Canceled', value: canceledCount, icon: XCircle, color: 'text-slate-400' },
                        { label: 'Launch Tier Users', value: launchTierCount, icon: Rocket, color: 'text-green-400' },
                        { label: 'Est. MRR', value: `$${MRR}`, icon: TrendingUp, color: 'text-orange-400' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label} className="bg-[#0f1419] border-blue-900/20">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`w-4 h-4 ${color}`} />
                                    <span className="text-blue-400 text-xs">{label}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Launch Tier Capacity */}
                <Card className="bg-[#0f1419] border-green-900/30 mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-green-400" />
                            Launch Tier Capacity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { key: 'launch_1', label: 'Launch Access ($1/yr)', cap: 50 },
                                { key: 'launch_10', label: 'Founding Access ($10/yr)', cap: 50 },
                            ].map(({ key, label, cap }) => {
                                const used = launchCounts?.[key] || subscriptions.filter(s => s.plan_key === key && s.status === 'active').length;
                                const pct = Math.min(100, Math.round((used / cap) * 100));
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-green-300">{label}</span>
                                            <span className="text-white">{used}/{cap} slots used</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{cap - used} spots remaining</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                        <Input
                            placeholder="Search by email, name or plan…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 bg-[#0f1419] border-blue-900/30 text-white"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'active', 'past_due', 'canceled', 'trial'].map(s => (
                            <Button
                                key={s}
                                size="sm"
                                variant={filterStatus === s ? 'default' : 'outline'}
                                className={filterStatus === s ? 'bg-blue-700' : 'border-blue-900/30 text-blue-400'}
                                onClick={() => setFilterStatus(s)}
                            >
                                {s === 'all' ? 'All' : s.replace('_', ' ')}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 text-center text-blue-400">Loading subscriptions…</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-8 text-center text-blue-400">No subscriptions found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-blue-900/20 text-blue-400 text-xs uppercase">
                                            <th className="text-left px-4 py-3">User</th>
                                            <th className="text-left px-4 py-3">Plan</th>
                                            <th className="text-left px-4 py-3">Status</th>
                                            <th className="text-left px-4 py-3">Billing</th>
                                            <th className="text-left px-4 py-3">Period End</th>
                                            <th className="text-left px-4 py-3">Flags</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(sub => {
                                            const statusCfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.trial;
                                            const StatusIcon = statusCfg.icon;
                                            return (
                                                <tr key={sub.id} className="border-b border-blue-900/10 hover:bg-blue-900/10 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="text-white font-medium">{sub.user_name || '—'}</p>
                                                        <p className="text-blue-400 text-xs">{sub.user_email}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge className={`${PLAN_BADGE_COLOR[sub.plan_key] || 'bg-slate-700'} capitalize`}>
                                                            {sub.plan_name || sub.plan_key}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge className={`${statusCfg.color} flex items-center gap-1 w-fit`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusCfg.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-blue-300 capitalize">{sub.billing_interval || '—'}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-blue-300">
                                                            {sub.current_period_end
                                                                ? format(new Date(sub.current_period_end * 1000), 'MMM d, yyyy')
                                                                : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 flex flex-wrap gap-1">
                                                        {sub.is_launch_tier && <Badge className="bg-green-900 text-green-300 text-xs">Launch</Badge>}
                                                        {sub.cancel_at_period_end && <Badge className="bg-yellow-900 text-yellow-300 text-xs">Cancels</Badge>}
                                                        {(sub.status === 'past_due' || sub.status === 'payment_failed') && (
                                                            <Badge className="bg-red-900 text-red-300 text-xs">⚠ Payment</Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}