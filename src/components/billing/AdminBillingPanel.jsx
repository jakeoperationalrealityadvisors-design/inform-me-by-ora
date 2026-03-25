import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, Search, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
    active:         { color: 'bg-green-700 text-green-100',  icon: CheckCircle2, label: 'Active' },
    trialing:       { color: 'bg-blue-700 text-blue-100',    icon: Clock,         label: 'Trialing' },
    trial:          { color: 'bg-slate-700 text-slate-200',  icon: Clock,         label: 'Free Trial' },
    past_due:       { color: 'bg-red-700 text-red-100',      icon: AlertCircle,   label: 'Past Due' },
    payment_failed: { color: 'bg-red-800 text-red-100',      icon: AlertCircle,   label: 'Payment Failed' },
    canceled:       { color: 'bg-slate-700 text-slate-300',  icon: XCircle,       label: 'Canceled' },
};

const PLAN_DISPLAY = {
    trial:      { label: 'Free Trial',      tier: 'Free',        interval: '—' },
    launch_1:   { label: 'Launch Access',   tier: 'Pro-level',   interval: 'yearly' },
    launch_10:  { label: 'Founding Access', tier: 'Pro-level',   interval: 'yearly' },
    basic:      { label: 'Basic',           tier: 'Basic',       interval: 'monthly' },
    pro:        { label: 'Professional',    tier: 'Pro',         interval: 'monthly' },
    enterprise: { label: 'Enterprise',      tier: 'Enterprise',  interval: 'monthly' },
};

export default function AdminBillingPanel() {
    const [search, setSearch] = useState('');

    const { data: subscriptions = [], isLoading } = useQuery({
        queryKey: ['admin-subscriptions'],
        queryFn: () => base44.asServiceRole.entities.UserSubscription.list('-created_date', 200),
    });

    const { data: users = [] } = useQuery({
        queryKey: ['all-users-billing'],
        queryFn: () => base44.asServiceRole.entities.User.list('-created_date', 200),
    });

    // Build lookup map
    const userMap = Object.fromEntries(users.map(u => [u.email, u]));

    // Merge: include users without subscription records too (they're on free trial)
    const allEmails = new Set([
        ...subscriptions.map(s => s.user_email),
        ...users.map(u => u.email),
    ]);

    const rows = [...allEmails].map(email => {
        const sub = subscriptions.find(s => s.user_email === email);
        const user = userMap[email];
        return { email, sub, user };
    });

    const filtered = rows.filter(r =>
        r.email?.toLowerCase().includes(search.toLowerCase()) ||
        r.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.sub?.plan_key?.toLowerCase().includes(search.toLowerCase())
    );

    // Summary counts
    const activePaid   = subscriptions.filter(s => s.status === 'active' && s.plan_key !== 'trial').length;
    const pastDue      = subscriptions.filter(s => s.status === 'past_due' || s.status === 'payment_failed').length;
    const launch1Count = subscriptions.filter(s => s.plan_key === 'launch_1' && s.status === 'active').length;
    const launch10Count= subscriptions.filter(s => s.plan_key === 'launch_10' && s.status === 'active').length;

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Active Paid', value: activePaid, color: 'text-green-400' },
                    { label: 'Past Due / Failed', value: pastDue, color: 'text-red-400' },
                    { label: 'Launch Access spots', value: `${launch1Count}/50`, color: 'text-yellow-400' },
                    { label: 'Founding Access spots', value: `${launch10Count}/50`, color: 'text-teal-400' },
                ].map(({ label, value, color }) => (
                    <Card key={label} className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-4 pb-3">
                            <p className="text-blue-400 text-xs">{label}</p>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <CardTitle className="text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#FF8C00]" />
                            Billing Records ({filtered.length})
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                            <Input
                                placeholder="Search user or plan..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-blue-400 text-sm">Loading...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-blue-900/20 text-left">
                                        {['User', 'Plan', 'Tier', 'Status', 'Interval', 'Launch', 'Period End', 'Cancels'].map(h => (
                                            <th key={h} className="pb-2 text-blue-400 font-medium pr-4">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(({ email, sub, user }) => {
                                        const planKey = sub?.plan_key || 'trial';
                                        const status  = sub?.status  || 'trial';
                                        const planMeta   = PLAN_DISPLAY[planKey] || PLAN_DISPLAY.trial;
                                        const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.trial;
                                        const StatusIcon = statusConf.icon;

                                        return (
                                            <tr key={email} className="border-b border-blue-900/10 hover:bg-blue-950/20">
                                                <td className="py-2 pr-4">
                                                    <p className="text-white font-medium">{user?.full_name || '—'}</p>
                                                    <p className="text-blue-400/60 text-xs">{email}</p>
                                                </td>
                                                <td className="py-2 pr-4 text-white">{planMeta.label}</td>
                                                <td className="py-2 pr-4">
                                                    <Badge variant="outline" className="text-xs border-blue-900/30 text-blue-300">
                                                        {planMeta.tier}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 pr-4">
                                                    <Badge className={`${statusConf.color} text-xs flex items-center gap-1 w-fit`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConf.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-2 pr-4 text-blue-300 capitalize">{planMeta.interval}</td>
                                                <td className="py-2 pr-4">
                                                    {sub?.is_launch_tier
                                                        ? <Badge className="bg-yellow-700/50 text-yellow-300 text-xs">Launch</Badge>
                                                        : <span className="text-blue-400/40">—</span>}
                                                </td>
                                                <td className="py-2 pr-4 text-blue-300 text-xs">
                                                    {sub?.current_period_end
                                                        ? format(new Date(sub.current_period_end * 1000), 'MMM d, yyyy')
                                                        : '—'}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {sub?.cancel_at_period_end
                                                        ? <Badge className="bg-orange-700/50 text-orange-300 text-xs">At Period End</Badge>
                                                        : <span className="text-blue-400/40">—</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filtered.length === 0 && (
                                <p className="text-center text-blue-400/60 py-8">No billing records found</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}