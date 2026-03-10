import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
    ListTodo, FileText, CheckSquare, FolderOpen, BarChart3,
    MessageSquare, Scan, Sparkles, Plus, ArrowRight,
    AlertCircle, Calendar, TrendingUp, Activity, Bell
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from '@/components/auth/RoleGuard';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#0f1624] border border-white/5 rounded-2xl p-4 flex items-center gap-4"
    >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
        </div>
    </motion.div>
);

const NavCard = ({ icon: Icon, label, description, path, gradient, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
    >
        <Link to={createPageUrl(path)}>
            <div className="group bg-[#0f1624] border border-white/5 rounded-2xl p-5 hover:border-white/10 hover:bg-[#141c2e] transition-all cursor-pointer h-full">
                <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">{description}</p>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 mt-3 transition-colors" />
            </div>
        </Link>
    </motion.div>
);

export default function Home() {
    const { user, canCreateForms } = useUserRole();

    const { data: tasks = [] } = useQuery({
        queryKey: ['home-tasks'],
        queryFn: async () => {
            const all = await base44.entities.Task.list('-created_date', 50);
            return all.filter(t => t.assigned_to_email === user?.email);
        },
        enabled: !!user
    });

    const { data: formSubs = [] } = useQuery({
        queryKey: ['home-form-subs'],
        queryFn: async () => {
            const all = await base44.entities.FormSubmission.list('-created_date', 50);
            return all.filter(f => f.assigned_to_email === user?.email);
        },
        enabled: !!user
    });

    const { data: checklistSubs = [] } = useQuery({
        queryKey: ['home-checklist-subs'],
        queryFn: async () => {
            const all = await base44.entities.ChecklistSubmission.list('-created_date', 50);
            return all.filter(c => c.assigned_to_email === user?.email);
        },
        enabled: !!user
    });

    const { data: recentActivity = [] } = useQuery({
        queryKey: ['home-activity'],
        queryFn: async () => {
            const all = await base44.entities.ActivityLog.list('-created_date', 10);
            return all.filter(a => a.user_email === user?.email);
        },
        enabled: !!user
    });

    const allTasks = [...tasks, ...formSubs, ...checklistSubs];
    const overdueTasks = allTasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
    const todayTasks = allTasks.filter(t => t.due_date && isToday(new Date(t.due_date)));
    const pending = allTasks.filter(t => ['todo', 'in_progress', 'submitted'].includes(t.status));

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const firstName = user?.full_name?.split(' ')[0] || 'there';

    const navCards = [
        { icon: FileText, label: 'Submissions', description: 'Forms & checklists assigned to you', path: 'Submissions', gradient: 'bg-blue-600', delay: 0.05 },
        { icon: ListTodo, label: 'Tasks', description: 'Manage your work queue', path: 'MyTasks', gradient: 'bg-orange-500', delay: 0.1 },
        { icon: FolderOpen, label: 'Documents', description: 'Files, folders & uploads', path: 'Documents', gradient: 'bg-indigo-600', delay: 0.15 },
        { icon: BarChart3, label: 'Reports', description: 'Analytics & insights', path: 'Reports', gradient: 'bg-emerald-600', delay: 0.2 },
        { icon: MessageSquare, label: 'Messages', description: 'Team conversations', path: 'Messages', gradient: 'bg-purple-600', delay: 0.25 },
        { icon: Scan, label: 'Scanner', description: 'Capture & process documents', path: 'Scanner', gradient: 'bg-cyan-600', delay: 0.3 },
    ];

    return (
        <div className="min-h-screen bg-[#0a0e17] pb-24 sm:pb-8">
            {/* Hero Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-700/5 pointer-events-none" />
                <div className="max-w-5xl mx-auto px-4 pt-8 pb-6">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <p className="text-white/40 text-sm font-medium">{greeting},</p>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                            {firstName} 👋
                        </h1>
                        <p className="text-white/40 text-sm mt-2">
                            {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </motion.div>

                    {/* Quick create buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap gap-2 mt-5"
                    >
                        <Link to={createPageUrl('CreateTask')}>
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 rounded-full">
                                <Plus className="w-3.5 h-3.5" /> New Task
                            </Button>
                        </Link>
                        <Link to={createPageUrl('AIAssistantPage')}>
                            <Button size="sm" variant="outline" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 gap-1.5 rounded-full">
                                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> AI Assistant
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard icon={ListTodo} label="Total Tasks" value={allTasks.length} color="bg-blue-500/15 text-blue-400" delay={0} />
                    <StatCard icon={Calendar} label="Due Today" value={todayTasks.length} color="bg-orange-500/15 text-orange-400" delay={0.05} />
                    <StatCard icon={AlertCircle} label="Overdue" value={overdueTasks.length} color="bg-red-500/15 text-red-400" delay={0.1} />
                    <StatCard icon={TrendingUp} label="In Progress" value={pending.length} color="bg-emerald-500/15 text-emerald-400" delay={0.15} />
                </div>

                {/* Overdue alert */}
                {overdueTasks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3"
                    >
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-300 flex-1">
                            You have <span className="font-semibold">{overdueTasks.length} overdue {overdueTasks.length === 1 ? 'item' : 'items'}</span> — tackle them first!
                        </p>
                        <Link to={createPageUrl('MyTasks')}>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 px-2 py-1 h-auto text-xs">
                                View <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </Link>
                    </motion.div>
                )}

                {/* Navigation Grid */}
                <div>
                    <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">Quick Access</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {navCards.map(card => (
                            <NavCard key={card.path} {...card} />
                        ))}
                    </div>
                </div>

                {/* Today's Tasks + Recent Activity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4">
                    {/* Today's tasks */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">Due Today</p>
                            <Link to={createPageUrl('MyTasks')}>
                                <span className="text-xs text-orange-400 hover:text-orange-300">See all →</span>
                            </Link>
                        </div>
                        <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                            {todayTasks.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {todayTasks.slice(0, 5).map(task => (
                                        <div key={task.id} className="px-4 py-3 flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                            <p className="text-sm text-white flex-1 truncate">
                                                {task.title || task.form_title || task.checklist_title}
                                            </p>
                                            {task.priority === 'urgent' && (
                                                <Badge className="bg-red-500/15 text-red-400 text-[10px] px-1.5 py-0">urgent</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <CheckSquare className="w-8 h-8 text-white/10 mx-auto mb-2" />
                                    <p className="text-sm text-white/30">Nothing due today 🎉</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">Recent Activity</p>
                        </div>
                        <div className="bg-[#0f1624] border border-white/5 rounded-2xl overflow-hidden">
                            {recentActivity.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {recentActivity.slice(0, 5).map(activity => (
                                        <div key={activity.id} className="px-4 py-3 flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white/80 leading-snug truncate">{activity.description}</p>
                                                <p className="text-[10px] text-white/25 mt-0.5">
                                                    {format(parseISO(activity.created_date), 'h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <Activity className="w-8 h-8 text-white/10 mx-auto mb-2" />
                                    <p className="text-sm text-white/30">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}