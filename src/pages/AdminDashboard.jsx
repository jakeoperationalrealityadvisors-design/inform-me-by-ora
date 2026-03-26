import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, ClipboardList, CheckCircle, AlertTriangle, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            base44.entities.Task.list('-created_date', 50),
            base44.entities.User.list()
        ]).then(([t, u]) => {
            setTasks(t);
            setUsers(u);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(t => t.due_date === today);
    const completedToday = todayTasks.filter(t => t.status === 'completed');
    const issues = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');
    const activeUsers = users.filter(u => u.role !== 'admin');

    const kpis = [
        { label: 'Active Users', value: activeUsers.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Tasks Today', value: todayTasks.length, icon: ClipboardList, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
        { label: 'Completed Today', value: completedToday.length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        { label: 'Urgent Issues', value: issues.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    ];

    const recentTasks = tasks.slice(0, 8);

    const statusColor = { todo: 'bg-slate-600 text-slate-300', in_progress: 'bg-blue-500/20 text-blue-300', completed: 'bg-green-500/20 text-green-300', cancelled: 'bg-red-500/20 text-red-300' };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Welcome back — here's what's happening today.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`border rounded-xl p-4 ${bg}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-400 text-xs mb-1">{label}</p>
                                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                            </div>
                            <Icon className={`w-5 h-5 ${color} mt-1`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold">Recent Tasks</h2>
                        <Link to="/AdminTasks" className="text-orange-400 text-xs hover:text-orange-300 flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentTasks.length === 0 ? (
                        <div className="text-center py-8">
                            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">No tasks yet</p>
                            <Link to="/AdminTasks" className="text-orange-400 text-sm hover:underline mt-1 inline-block">Create a task →</Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                                    <div className="min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{task.title}</p>
                                        <p className="text-slate-500 text-xs">{task.assigned_to_name || 'Unassigned'}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusColor[task.status] || 'bg-slate-600 text-slate-300'}`}>
                                        {task.status?.replace('_', ' ') || 'todo'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Active Users */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-semibold">Team Members</h2>
                        <Link to="/AdminUsers" className="text-orange-400 text-xs hover:text-orange-300 flex items-center gap-1">
                            Manage <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {activeUsers.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">No users yet</p>
                            <Link to="/AdminUsers" className="text-orange-400 text-sm hover:underline mt-1 inline-block">Add users →</Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeUsers.slice(0, 8).map(u => (
                                <div key={u.id} className="flex items-center gap-3 py-2 border-b border-slate-700 last:border-0">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-orange-400 font-bold text-xs">{(u.full_name || u.email || 'U')[0].toUpperCase()}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-white text-sm font-medium truncate">{u.full_name || u.email}</p>
                                        <p className="text-slate-500 text-xs">{u.email}</p>
                                    </div>
                                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'New Task', path: '/AdminTasks', icon: ClipboardList },
                    { label: 'Add User', path: '/AdminUsers', icon: Users },
                    { label: 'Messages', path: '/AdminMessages', icon: TrendingUp },
                    { label: 'Reports', path: '/AdminReports', icon: Clock },
                ].map(({ label, path, icon: Icon }) => (
                    <Link key={label} to={path}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors group">
                        <Icon className="w-6 h-6 text-orange-400 group-hover:text-orange-300" />
                        <span className="text-slate-300 text-xs font-medium">{label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}