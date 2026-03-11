import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    LayoutDashboard, Users, FileText, CheckSquare, ListTodo,
    FolderOpen, Activity, AlertCircle, Zap, Eye, Search,
    ArrowRight, TrendingUp, Clock, RefreshCw, Shield,
    ChevronRight, Circle, MoreHorizontal, Building2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import RoleGuard from '@/components/auth/RoleGuard';
import { format, parseISO, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const SECTIONS = [
    { id: 'overview',     label: 'Overview',       icon: LayoutDashboard },
    { id: 'users',        label: 'Users',           icon: Users },
    { id: 'tasks',        label: 'Tasks',           icon: ListTodo },
    { id: 'submissions',  label: 'Submissions',     icon: FileText },
    { id: 'documents',    label: 'Documents',       icon: FolderOpen },
    { id: 'activity',     label: 'Activity Log',    icon: Activity },
    { id: 'errors',       label: 'Errors',          icon: AlertCircle },
    { id: 'automations',  label: 'Automations',     icon: Zap },
];

const priorityColors = {
    low: 'bg-blue-500/15 text-blue-400',
    medium: 'bg-yellow-500/15 text-yellow-400',
    high: 'bg-orange-500/15 text-orange-400',
    urgent: 'bg-red-500/15 text-red-400',
};

const statusColors = {
    todo: 'bg-slate-500/15 text-slate-400',
    in_progress: 'bg-blue-500/15 text-blue-400',
    completed: 'bg-emerald-500/15 text-emerald-400',
    cancelled: 'bg-red-500/15 text-red-400',
    submitted: 'bg-purple-500/15 text-purple-400',
    active: 'bg-emerald-500/15 text-emerald-400',
    draft: 'bg-slate-500/15 text-slate-400',
};

function Pill({ children, className = '' }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${className}`}>
            {children}
        </span>
    );
}

function SectionHeader({ title, subtitle, count, onRefresh }) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
                {count !== undefined && (
                    <span className="text-2xl font-bold text-white/60">{count}</span>
                )}
                {onRefresh && (
                    <Button variant="ghost" size="icon" onClick={onRefresh} className="text-white/30 hover:text-white/60 h-8 w-8">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────
// OVERVIEW SECTION
// ──────────────────────────────────────────────────
function OverviewSection({ users, tasks, formSubs, checklistSubs, activities, errors, automations }) {
    const allTasks = [...tasks, ...formSubs, ...checklistSubs];
    const overdue = allTasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
    const activeAutomations = automations.filter(a => a.enabled);

    const submissionsByDay = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const label = format(d, 'MMM d');
            const count = [...formSubs, ...checklistSubs].filter(s =>
                new Date(s.created_date).toDateString() === d.toDateString()
            ).length;
            days.push({ date: label, count });
        }
        return days;
    }, [formSubs, checklistSubs]);

    const stats = [
        { label: 'Total Users', value: users.length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Users },
        { label: 'All Tasks', value: allTasks.length, color: 'text-orange-400', bg: 'bg-orange-500/10', icon: ListTodo },
        { label: 'Overdue', value: overdue.length, color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle },
        { label: 'Unresolved Errors', value: errors.length, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: AlertCircle },
        { label: 'Submissions', value: formSubs.length + checklistSubs.length, color: 'text-purple-400', bg: 'bg-purple-500/10', icon: FileText },
        { label: 'Active Automations', value: activeAutomations.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Zap },
    ];

    return (
        <div className="space-y-8">
            <SectionHeader title="System Overview" subtitle="Live snapshot of all platform activity" />

            <div className="grid grid-cols-3 gap-4">
                {stats.map(s => (
                    <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white/5`}>
                        <div className="flex items-center gap-2 mb-2">
                            <s.icon className={`w-4 h-4 ${s.color}`} />
                            <span className="text-xs text-white/40 font-medium">{s.label}</span>
                        </div>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0f1624] border border-white/5 rounded-2xl p-5">
                    <p className="text-sm text-white/40 font-semibold mb-4">Submissions — Last 7 Days</p>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={submissionsByDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                            <XAxis dataKey="date" stroke="#ffffff30" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#ffffff30" tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#0f1624', border: '1px solid #ffffff15', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
                            <Bar dataKey="count" fill="#FF8C00" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-[#0f1624] border border-white/5 rounded-2xl p-5">
                    <p className="text-sm text-white/40 font-semibold mb-3">Recent Activity Stream</p>
                    <div className="space-y-2 max-h-[168px] overflow-y-auto">
                        {activities.slice(0, 8).map(a => (
                            <div key={a.id} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/70 truncate">{a.description}</p>
                                    <p className="text-[10px] text-white/25">{a.user_name} · {formatDistanceToNow(parseISO(a.created_date), { addSuffix: true })}</p>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && <p className="text-xs text-white/30 text-center py-6">No recent activity</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────
// USERS SECTION
// ──────────────────────────────────────────────────
function UsersSection({ users }) {
    const [search, setSearch] = useState('');
    const filtered = users.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <SectionHeader title="All Users" subtitle="Every registered account on the platform" count={users.length} />
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="pl-9 bg-[#0f1624] border-white/10 text-white placeholder:text-white/30"
                />
            </div>
            <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5 text-white/30 text-xs font-semibold uppercase tracking-widest">
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3 text-left">Role</th>
                            <th className="px-4 py-3 text-left">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {u.full_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{u.full_name || '—'}</p>
                                            <p className="text-white/40 text-xs">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Pill className={u.role === 'admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}>
                                        {u.role || 'user'}
                                    </Pill>
                                </td>
                                <td className="px-4 py-3 text-white/40 text-xs">
                                    {u.created_date ? format(parseISO(u.created_date), 'MMM d, yyyy') : '—'}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={3} className="px-4 py-10 text-center text-white/30">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────
// TASKS SECTION
// ──────────────────────────────────────────────────
function TasksSection({ tasks }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = tasks.filter(t => {
        const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.assigned_to_email?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div>
            <SectionHeader title="All Tasks" subtitle="Every task across all users" count={tasks.length} />
            <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-9 bg-[#0f1624] border-white/10 text-white placeholder:text-white/30" />
                </div>
                <div className="flex gap-2">
                    {['all', 'todo', 'in_progress', 'completed'].map(s => (
                        <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'ghost'}
                            onClick={() => setStatusFilter(s)}
                            className={statusFilter === s ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'text-white/40 hover:text-white/70'}>
                            {s === 'all' ? 'All' : s.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5 text-white/30 text-xs font-semibold uppercase tracking-widest">
                            <th className="px-4 py-3 text-left">Task</th>
                            <th className="px-4 py-3 text-left">Assigned To</th>
                            <th className="px-4 py-3 text-left">Priority</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Due</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 100).map(t => (
                            <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-white font-medium truncate max-w-[240px]">{t.title}</p>
                                    {t.description && <p className="text-white/30 text-xs truncate max-w-[240px]">{t.description}</p>}
                                </td>
                                <td className="px-4 py-3 text-white/50 text-xs">{t.assigned_to_name || t.assigned_to_email || '—'}</td>
                                <td className="px-4 py-3">
                                    {t.priority && <Pill className={priorityColors[t.priority]}>{t.priority}</Pill>}
                                </td>
                                <td className="px-4 py-3">
                                    <Pill className={statusColors[t.status] || 'bg-slate-500/15 text-slate-400'}>{t.status || '—'}</Pill>
                                </td>
                                <td className="px-4 py-3 text-xs">
                                    {t.due_date ? (
                                        <span className={isPast(new Date(t.due_date)) && t.status !== 'completed' ? 'text-red-400' : 'text-white/40'}>
                                            {format(new Date(t.due_date), 'MMM d')}
                                        </span>
                                    ) : <span className="text-white/20">—</span>}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center text-white/30">No tasks found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────
// SUBMISSIONS SECTION
// ──────────────────────────────────────────────────
function SubmissionsSection({ formSubs, checklistSubs }) {
    const [tab, setTab] = useState('forms');
    const [search, setSearch] = useState('');

    const items = tab === 'forms' ? formSubs : checklistSubs;
    const filtered = items.filter(s =>
        !search ||
        (s.form_title || s.checklist_title)?.toLowerCase().includes(search.toLowerCase()) ||
        s.submitted_by_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.assigned_to_email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <SectionHeader title="All Submissions" subtitle="Every form and checklist submission" count={formSubs.length + checklistSubs.length} />
            <div className="flex gap-3 mb-4">
                <div className="flex gap-2 p-1 bg-[#0f1624] rounded-xl border border-white/5">
                    {['forms', 'checklists'].map(t => (
                        <Button key={t} size="sm" variant="ghost"
                            onClick={() => setTab(t)}
                            className={tab === t ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-white/40 hover:text-white/60'}>
                            {t === 'forms' ? `Forms (${formSubs.length})` : `Checklists (${checklistSubs.length})`}
                        </Button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions…" className="pl-9 bg-[#0f1624] border-white/10 text-white placeholder:text-white/30" />
                </div>
            </div>
            <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5 text-white/30 text-xs font-semibold uppercase tracking-widest">
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Submitted By</th>
                            <th className="px-4 py-3 text-left">Assigned To</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 100).map(s => (
                            <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-white font-medium truncate max-w-[200px]">{s.form_title || s.checklist_title || '—'}</p>
                                </td>
                                <td className="px-4 py-3 text-white/50 text-xs">{s.submitted_by_name || '—'}</td>
                                <td className="px-4 py-3 text-white/50 text-xs">{s.assigned_to_email || '—'}</td>
                                <td className="px-4 py-3">
                                    <Pill className={statusColors[s.status] || 'bg-slate-500/15 text-slate-400'}>{s.status || '—'}</Pill>
                                </td>
                                <td className="px-4 py-3 text-white/30 text-xs">
                                    {s.created_date ? format(parseISO(s.created_date), 'MMM d, yyyy') : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <Link to={createPageUrl(tab === 'forms' ? `ViewFormSubmission?id=${s.id}` : `ViewChecklistSubmission?id=${s.id}`)}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/20 hover:text-white/60">
                                            <Eye className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-white/30">No submissions found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────
// DOCUMENTS SECTION
// ──────────────────────────────────────────────────
function DocumentsSection({ documents }) {
    const [search, setSearch] = useState('');
    const filtered = documents.filter(d =>
        !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.file_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <SectionHeader title="All Documents" subtitle="Every uploaded file across the platform" count={documents.length} />
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…" className="pl-9 bg-[#0f1624] border-white/10 text-white placeholder:text-white/30" />
            </div>
            <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5 text-white/30 text-xs font-semibold uppercase tracking-widest">
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Uploaded By</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 100).map(d => (
                            <tr key={d.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-white font-medium truncate max-w-[200px]">{d.title}</p>
                                    <p className="text-white/30 text-xs truncate max-w-[200px]">{d.file_name}</p>
                                </td>
                                <td className="px-4 py-3 text-white/50 text-xs">{d.uploaded_by_name || d.created_by || '—'}</td>
                                <td className="px-4 py-3 text-white/40 text-xs">{d.file_type?.split('/')[1]?.toUpperCase() || '—'}</td>
                                <td className="px-4 py-3">
                                    <Pill className={statusColors[d.status] || 'bg-slate-500/15 text-slate-400'}>{d.status || 'active'}</Pill>
                                </td>
                                <td className="px-4 py-3 text-white/30 text-xs">
                                    {d.created_date ? format(parseISO(d.created_date), 'MMM d, yyyy') : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <Link to={createPageUrl(`ViewDocument?id=${d.id}`)}>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/20 hover:text-white/60">
                                            <Eye className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-white/30">No documents found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────
// ACTIVITY LOG SECTION
// ──────────────────────────────────────────────────
function ActivitySection({ activities }) {
    const [search, setSearch] = useState('');
    const filtered = activities.filter(a =>
        !search || a.description?.toLowerCase().includes(search.toLowerCase()) || a.user_name?.toLowerCase().includes(search.toLowerCase())
    );

    const actionTypeColor = (type) => {
        if (type?.includes('delete')) return 'bg-red-500/15 text-red-400';
        if (type?.includes('create')) return 'bg-emerald-500/15 text-emerald-400';
        if (type?.includes('update') || type?.includes('edit')) return 'bg-blue-500/15 text-blue-400';
        if (type?.includes('submit')) return 'bg-purple-500/15 text-purple-400';
        return 'bg-slate-500/15 text-slate-400';
    };

    return (
        <div>
            <SectionHeader title="Activity Log" subtitle="Complete audit trail of all user actions" count={activities.length} />
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activity…" className="pl-9 bg-[#0f1624] border-white/10 text-white placeholder:text-white/30" />
            </div>
            <div className="space-y-2">
                {filtered.slice(0, 100).map((a, idx) => (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.01 }}
                        className="bg-[#0f1624] border border-white/5 rounded-xl px-4 py-3 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/30 to-blue-600/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                            {a.user_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80">{a.description}</p>
                            <p className="text-xs text-white/30 mt-0.5">
                                {a.user_name} · {a.created_date ? formatDistanceToNow(parseISO(a.created_date), { addSuffix: true }) : '—'}
                            </p>
                        </div>
                        <Pill className={actionTypeColor(a.action_type)}>{a.action_type?.replace(/_/g, ' ')}</Pill>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-10 text-white/30">No activity found</div>
                )}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────
// ERRORS SECTION
// ──────────────────────────────────────────────────
function ErrorsSection({ errors }) {
    return (
        <div>
            <SectionHeader title="Error Log" subtitle="Unresolved system and client errors" count={errors.length} />
            {errors.length === 0 ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <p className="text-emerald-400 font-semibold">All Clear</p>
                    <p className="text-white/30 text-sm mt-1">No unresolved errors</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {errors.map(e => (
                        <div key={e.id} className="bg-[#0f1624] border border-red-500/15 rounded-2xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <Pill className="bg-red-500/20 text-red-400">{e.error_type}</Pill>
                                <span className="text-xs text-white/30">{e.created_date ? format(parseISO(e.created_date), 'MMM d, h:mm a') : '—'}</span>
                            </div>
                            <p className="text-sm text-red-300 font-medium mb-1">{e.message}</p>
                            {e.url && <p className="text-xs text-white/30 truncate">{e.url}</p>}
                            {e.user_email && <p className="text-xs text-white/30 mt-1">User: {e.user_email}</p>}
                            {e.stack && (
                                <details className="mt-2">
                                    <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50">Stack trace</summary>
                                    <pre className="text-[10px] text-white/30 mt-2 overflow-x-auto bg-black/30 rounded p-2 max-h-32">{e.stack}</pre>
                                </details>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────
// AUTOMATIONS SECTION
// ──────────────────────────────────────────────────
function AutomationsSection({ automations }) {
    return (
        <div>
            <SectionHeader title="Automations" subtitle="All automation rules and their status" count={automations.length} />
            <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5 text-white/30 text-xs font-semibold uppercase tracking-widest">
                            <th className="px-4 py-3 text-left">Rule Name</th>
                            <th className="px-4 py-3 text-left">Trigger</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                            <th className="px-4 py-3 text-left">Runs</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Last Run</th>
                        </tr>
                    </thead>
                    <tbody>
                        {automations.map(a => (
                            <tr key={a.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-white font-medium">{a.name}</p>
                                    {a.description && <p className="text-white/30 text-xs truncate max-w-[200px]">{a.description}</p>}
                                </td>
                                <td className="px-4 py-3">
                                    <Pill className="bg-blue-500/15 text-blue-400">{a.trigger_type?.replace(/_/g, ' ')}</Pill>
                                </td>
                                <td className="px-4 py-3 text-white/40 text-xs">{a.actions?.length || 0} action{a.actions?.length !== 1 ? 's' : ''}</td>
                                <td className="px-4 py-3 text-white/40 text-xs">{a.execution_count || 0}</td>
                                <td className="px-4 py-3">
                                    {a.enabled
                                        ? <Pill className="bg-emerald-500/15 text-emerald-400">Active</Pill>
                                        : <Pill className="bg-slate-500/15 text-slate-400">Disabled</Pill>}
                                </td>
                                <td className="px-4 py-3 text-white/30 text-xs">
                                    {a.last_executed ? formatDistanceToNow(parseISO(a.last_executed), { addSuffix: true }) : 'Never'}
                                </td>
                            </tr>
                        ))}
                        {automations.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-white/30">No automations configured</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────
function OversightContent() {
    const [activeSection, setActiveSection] = useState('overview');

    const { data: users = [] } = useQuery({ queryKey: ['oversight-users'], queryFn: () => base44.asServiceRole.entities.User.list() });
    const { data: tasks = [] } = useQuery({ queryKey: ['oversight-tasks'], queryFn: () => base44.entities.Task.list('-created_date', 200) });
    const { data: formSubs = [] } = useQuery({ queryKey: ['oversight-form-subs'], queryFn: () => base44.entities.FormSubmission.list('-created_date', 200) });
    const { data: checklistSubs = [] } = useQuery({ queryKey: ['oversight-checklist-subs'], queryFn: () => base44.entities.ChecklistSubmission.list('-created_date', 200) });
    const { data: documents = [] } = useQuery({ queryKey: ['oversight-documents'], queryFn: () => base44.entities.Document.list('-created_date', 200) });
    const { data: activities = [] } = useQuery({ queryKey: ['oversight-activity'], queryFn: () => base44.entities.ActivityLog.list('-created_date', 200) });
    const { data: errors = [] } = useQuery({ queryKey: ['oversight-errors'], queryFn: () => base44.entities.ErrorLog.filter({ resolved: false }, '-created_date', 100) });
    const { data: automations = [] } = useQuery({ queryKey: ['oversight-automations'], queryFn: () => base44.entities.AutomationRule.list() });

    const badgeCounts = {
        errors: errors.length,
        tasks: tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && t.status !== 'completed').length,
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'overview':    return <OverviewSection users={users} tasks={tasks} formSubs={formSubs} checklistSubs={checklistSubs} activities={activities} errors={errors} automations={automations} />;
            case 'users':       return <UsersSection users={users} />;
            case 'tasks':       return <TasksSection tasks={tasks} />;
            case 'submissions': return <SubmissionsSection formSubs={formSubs} checklistSubs={checklistSubs} />;
            case 'documents':   return <DocumentsSection documents={documents} />;
            case 'activity':    return <ActivitySection activities={activities} />;
            case 'errors':      return <ErrorsSection errors={errors} />;
            case 'automations': return <AutomationsSection automations={automations} />;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen bg-[#070b12] overflow-hidden">
            {/* Sidebar */}
            <div className="w-56 flex-shrink-0 bg-[#0a0e17] border-r border-white/5 flex flex-col">
                <div className="px-4 py-5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-blue-700 flex items-center justify-center">
                            <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-none">Oversight</p>
                            <p className="text-white/30 text-[10px] mt-0.5">Admin Control Center</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    {SECTIONS.map(s => {
                        const isActive = activeSection === s.id;
                        const badge = s.id === 'errors' ? badgeCounts.errors : s.id === 'tasks' ? badgeCounts.tasks : null;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                                    isActive
                                        ? 'bg-orange-500/15 text-orange-400 font-medium'
                                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                                }`}
                            >
                                <s.icon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-left">{s.label}</span>
                                {badge > 0 && (
                                    <span className="text-[10px] bg-red-500/30 text-red-400 rounded-full px-1.5 py-0.5 font-bold">{badge}</span>
                                )}
                                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-white/5 space-y-1">
                    <Link to={createPageUrl('UserManagement')}>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-white/30 hover:text-white/60 text-xs gap-2 h-8">
                            <Users className="w-3.5 h-3.5" /> Manage Users
                        </Button>
                    </Link>
                    <Link to={createPageUrl('ManageAutomations')}>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-white/30 hover:text-white/60 text-xs gap-2 h-8">
                            <Zap className="w-3.5 h-3.5" /> Manage Automations
                        </Button>
                    </Link>
                    <Link to={createPageUrl('Settings')}>
                        <Button variant="ghost" size="sm" className="w-full justify-start text-white/30 hover:text-white/60 text-xs gap-2 h-8">
                            <Shield className="w-3.5 h-3.5" /> Settings
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-8 py-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                        >
                            {renderSection()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export default function OversightDashboard() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <OversightContent />
        </RoleGuard>
    );
}