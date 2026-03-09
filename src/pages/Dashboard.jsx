import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ListTodo, FileText, CheckSquare, Plus, Activity, Calendar, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from '@/components/auth/RoleGuard';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';

export default function Dashboard() {
    const { user, canCreateForms, canCreateChecklists } = useUserRole();
    
    const { data: standaloneTasks = [] } = useQuery({
        queryKey: ['my-standalone-tasks'],
        queryFn: async () => {
            const all = await base44.entities.Task.list('-created_date', 50);
            return all.filter(t => t.assigned_to_email === user?.email);
        },
        enabled: !!user
    });
    
    const { data: formSubmissions = [] } = useQuery({
        queryKey: ['my-form-submissions'],
        queryFn: async () => {
            const all = await base44.entities.FormSubmission.list('-created_date', 50);
            return all.filter(f => f.assigned_to_email === user?.email);
        },
        enabled: !!user
    });
    
    const { data: checklistSubmissions = [] } = useQuery({
        queryKey: ['my-checklist-submissions'],
        queryFn: async () => {
            const all = await base44.entities.ChecklistSubmission.list('-created_date', 50);
            return all.filter(c => c.assigned_to_email === user?.email);
        },
        enabled: !!user
    });
    
    const { data: recentActivity = [] } = useQuery({
        queryKey: ['my-activity'],
        queryFn: async () => {
            const all = await base44.entities.ActivityLog.list('-created_date', 20);
            return all.filter(a => a.user_email === user?.email);
        },
        enabled: !!user
    });
    
    const allTasks = [...standaloneTasks, ...formSubmissions, ...checklistSubmissions];
    const overdueTasks = allTasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
    const todayTasks = allTasks.filter(t => t.due_date && isToday(new Date(t.due_date)));
    const pendingTasks = allTasks.filter(t => 
        (t.status === 'todo' || t.status === 'in_progress' || t.status === 'submitted')
    );
    
    const priorityColors = {
        low: 'bg-blue-500/10 text-blue-400',
        medium: 'bg-yellow-500/10 text-yellow-400',
        high: 'bg-orange-500/10 text-orange-400',
        urgent: 'bg-red-500/10 text-red-400'
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17] pb-20 md:pb-6">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
                            </h1>
                            <p className="text-sm text-blue-400 mt-1">Here's what's happening today</p>
                        </div>
                        <div className="flex gap-2">
                            {canCreateForms && (
                                <Link to={createPageUrl('CreateForm')}>
                                    <Button size="sm" className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Form
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-400">Total Tasks</p>
                                        <p className="text-3xl font-bold text-white mt-1">{allTasks.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-blue-950/50 flex items-center justify-center">
                                        <ListTodo className="w-6 h-6 text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-400">Due Today</p>
                                        <p className="text-3xl font-bold text-white mt-1">{todayTasks.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-orange-950/50 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-orange-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-400">Overdue</p>
                                        <p className="text-3xl font-bold text-white mt-1">{overdueTasks.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-red-950/50 flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-red-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-400">In Progress</p>
                                        <p className="text-3xl font-bold text-white mt-1">{pendingTasks.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-green-950/50 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* My Tasks */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-white flex items-center gap-2">
                                    <ListTodo className="w-5 h-5 text-[#FF8C00]" />
                                    My Assigned Tasks
                                </CardTitle>
                                <Link to={createPageUrl('MyTasks')}>
                                    <Button variant="ghost" size="sm" className="text-blue-400">
                                        View All
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {allTasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {allTasks.slice(0, 5).map((task, idx) => (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="p-3 rounded-lg border border-blue-900/20 hover:bg-blue-950/20 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">
                                                            {task.title || task.form_title || task.checklist_title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {task.priority && (
                                                                <Badge className={priorityColors[task.priority]}>
                                                                    {task.priority}
                                                                </Badge>
                                                            )}
                                                            {task.due_date && (
                                                                <span className="text-xs text-blue-400/70">
                                                                    Due {format(new Date(task.due_date), 'MMM d')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {task.form_title ? (
                                                        <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    ) : task.checklist_title ? (
                                                        <CheckSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    ) : (
                                                        <ListTodo className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-blue-400/60">
                                        <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No tasks assigned yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Recent Activity */}
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-[#FF8C00]" />
                                    My Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentActivity.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentActivity.slice(0, 6).map((activity, idx) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="flex items-start gap-3 pb-3 border-b border-blue-900/20 last:border-0 last:pb-0"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-[#FF8C00] mt-2 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white">{activity.description}</p>
                                                    <p className="text-xs text-blue-400/70 mt-1">
                                                        {format(parseISO(activity.created_date), 'MMM d, h:mm a')}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-blue-400/60">
                                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardHeader>
                                <CardTitle className="text-white">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link to={createPageUrl('CreateTask')}>
                                    <Button className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Task
                                    </Button>
                                </Link>
                                
                                <Link to={createPageUrl('Home')}>
                                    <Button variant="outline" className="w-full border-blue-900/30 text-white">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Browse Forms
                                    </Button>
                                </Link>
                                
                                <Link to={createPageUrl('MyTasks')}>
                                    <Button variant="outline" className="w-full border-blue-900/30 text-white">
                                        <ListTodo className="w-4 h-4 mr-2" />
                                        View All Tasks
                                    </Button>
                                </Link>
                                
                                <Link to={createPageUrl('Calendar')}>
                                    <Button variant="outline" className="w-full border-blue-900/30 text-white">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Open Calendar
                                    </Button>
                                </Link>
                                
                                <Link to={createPageUrl('Documents')}>
                                    <Button variant="outline" className="w-full border-blue-900/30 text-white">
                                        <FileText className="w-4 h-4 mr-2" />
                                        My Documents
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                        
                        {/* Forms & Checklists Summary */}
                        <Card className="bg-[#0f1419] border-blue-900/20">
                            <CardHeader>
                                <CardTitle className="text-white">Submissions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-950/20">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        <span className="text-white">Forms</span>
                                    </div>
                                    <Badge className="bg-blue-500/20 text-blue-400">
                                        {formSubmissions.length}
                                    </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-950/20">
                                    <div className="flex items-center gap-3">
                                        <CheckSquare className="w-5 h-5 text-green-400" />
                                        <span className="text-white">Checklists</span>
                                    </div>
                                    <Badge className="bg-green-500/20 text-green-400">
                                        {checklistSubmissions.length}
                                    </Badge>
                                </div>
                                
                                <Link to={createPageUrl('Submissions')}>
                                    <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300">
                                        View All Submissions
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
            <BottomNav />
        </div>
    );
}