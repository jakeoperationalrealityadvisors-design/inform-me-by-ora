import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, Download, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#ef4444'];

export default function AdminReports() {
    const [tasks, setTasks] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('tasks');

    useEffect(() => {
        Promise.all([
            base44.entities.Task.list('-created_date', 200),
            base44.entities.Document.list('-created_date', 100).catch(() => []),
        ]).then(([t, u]) => {
            setTasks(t);
            setUploads(u);
            setLoading(false);
        });
    }, []);

    const byStatus = [
        { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
        { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
        { name: 'Cancelled', value: tasks.filter(t => t.status === 'cancelled').length },
    ];

    const byPriority = [
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
        { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length },
    ];

    const exportCSV = () => {
        const rows = [
            ['Title', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Created'],
            ...tasks.map(t => [t.title, t.status, t.priority, t.assigned_to_name || '', t.due_date || '', new Date(t.created_date).toLocaleDateString()])
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'tasks-report.csv'; a.click();
    };

    const kpis = [
        { label: 'Total Tasks', value: tasks.length, icon: FileText, color: 'text-blue-400' },
        { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle, color: 'text-green-400' },
        { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'text-orange-400' },
        { label: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, icon: AlertTriangle, color: 'text-red-400' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Reports</h1>
                    <p className="text-slate-400 text-sm mt-1">Performance overview and analytics</p>
                </div>
                <Button onClick={exportCSV} variant="outline" className="border-slate-600 text-slate-300 hover:text-white gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Icon className={`w-6 h-6 ${color}`} />
                            <div>
                                <p className="text-slate-400 text-xs">{label}</p>
                                <p className="text-white text-2xl font-bold">{value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {['tasks', 'activity'].map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'}`}>{t}</button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
                </div>
            ) : tab === 'tasks' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                        <h3 className="text-white font-semibold mb-4">Tasks by Status</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                                    {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                        <h3 className="text-white font-semibold mb-4">Tasks by Priority</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={byPriority}>
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Task table */}
                    <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700">
                            <h3 className="text-white font-semibold">All Tasks</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Title</th>
                                        <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Assigned To</th>
                                        <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Status</th>
                                        <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Priority</th>
                                        <th className="text-left text-slate-400 text-xs font-medium px-4 py-3">Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.slice(0, 20).map(t => (
                                        <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-3 text-white text-sm">{t.title}</td>
                                            <td className="px-4 py-3 text-slate-400 text-sm">{t.assigned_to_name || '—'}</td>
                                            <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">{t.status?.replace('_', ' ')}</span></td>
                                            <td className="px-4 py-3 text-slate-400 text-sm capitalize">{t.priority}</td>
                                            <td className="px-4 py-3 text-slate-400 text-sm">{t.due_date || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-4">Activity Overview</h3>
                    <div className="space-y-3">
                        {tasks.slice(0, 15).map(t => (
                            <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                                <div>
                                    <p className="text-white text-sm">{t.title}</p>
                                    <p className="text-slate-500 text-xs">{new Date(t.created_date).toLocaleDateString()}</p>
                                </div>
                                <span className="text-xs text-slate-400 capitalize">{t.status?.replace('_', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}