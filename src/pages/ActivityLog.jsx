import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Activity, Search, Filter, Download, FileText, CheckSquare, ListTodo, Users, Settings as SettingsIcon, Folder } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoleGuard from '@/components/auth/RoleGuard';
import { format, parseISO, isWithinInterval, subDays } from 'date-fns';
import { motion } from 'framer-motion';

const ACTION_ICONS = {
    form_created: FileText,
    form_edited: FileText,
    form_deleted: FileText,
    form_submitted: FileText,
    checklist_created: CheckSquare,
    checklist_edited: CheckSquare,
    checklist_deleted: CheckSquare,
    checklist_submitted: CheckSquare,
    task_created: ListTodo,
    task_updated: ListTodo,
    task_completed: ListTodo,
    task_deleted: ListTodo,
    user_invited: Users,
    user_updated: Users,
    user_deleted: Users,
    category_created: Folder,
    category_edited: Folder,
    category_deleted: Folder,
    document_uploaded: FileText,
    document_deleted: FileText,
    automation_created: SettingsIcon,
    automation_edited: SettingsIcon,
    settings_changed: SettingsIcon
};

const ACTION_COLORS = {
    created: 'bg-green-500/10 text-green-400 border-green-500/20',
    edited: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    deleted: 'bg-red-500/10 text-red-400 border-red-500/20',
    submitted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    updated: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

function ActivityLogContent() {
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date()
    });
    const [selectedUser, setSelectedUser] = useState('all');
    const [selectedAction, setSelectedAction] = useState('all');
    const [actionType, setActionType] = useState('all');
    const [dateRange, setDateRange] = useState('7'); // days
    const [userFilter, setUserFilter] = useState('all');
    
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['activity-logs'],
        queryFn: () => base44.entities.ActivityLog.list('-created_date', 500)
    });
    
    const { data: users = [] } = useQuery({
        queryKey: ['all-users'],
        queryFn: () => base44.entities.User.list()
    });
    
    // Filter logs
    const filteredLogs = logs.filter(log => {
        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            if (
                !log.description?.toLowerCase().includes(searchLower) &&
                !log.entity_title?.toLowerCase().includes(searchLower) &&
                !log.user_name?.toLowerCase().includes(searchLower)
            ) {
                return false;
            }
        }
        
        // Action type filter
        if (actionType !== 'all' && log.action_type !== actionType) {
            return false;
        }
        
        // User filter
        if (userFilter !== 'all' && log.user_email !== userFilter) {
            return false;
        }
        
        // Date range filter
        if (dateRange !== 'all') {
            const logDate = parseISO(log.created_date);
            const cutoffDate = subDays(new Date(), parseInt(dateRange));
            if (!isWithinInterval(logDate, { start: cutoffDate, end: new Date() })) {
                return false;
            }
        }
        
        return true;
    });
    
    const exportLogs = () => {
        const csvData = [
            ['Date', 'User', 'Action', 'Entity', 'Description'],
            ...filteredLogs.map(log => [
                format(parseISO(log.created_date), 'yyyy-MM-dd HH:mm:ss'),
                log.user_name || log.user_email,
                log.action_type,
                log.entity_title || log.entity_type || '—',
                log.description
            ])
        ];
        
        const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };
    
    const getActionColor = (actionType) => {
        if (actionType.includes('created')) return ACTION_COLORS.created;
        if (actionType.includes('edited') || actionType.includes('updated')) return ACTION_COLORS.edited;
        if (actionType.includes('deleted')) return ACTION_COLORS.deleted;
        if (actionType.includes('submitted')) return ACTION_COLORS.submitted;
        if (actionType.includes('completed')) return ACTION_COLORS.completed;
        return ACTION_COLORS.updated;
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-[#FF8C00]" />
                                    Activity Log
                                </h1>
                                <p className="text-sm text-blue-400">Audit trail of all system activities</p>
                            </div>
                        </div>
                        <Button onClick={exportLogs} variant="outline" className="border-blue-900/30 text-[#FF8C00]">
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Filters */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400/60" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search activities..."
                                    className="pl-10 bg-[#0a0e17] border-blue-900/20 text-white"
                                />
                            </div>
                            
                            <Select value={actionType} onValueChange={setActionType}>
                                <SelectTrigger className="bg-[#0a0e17] border-blue-900/20 text-white">
                                    <SelectValue placeholder="Action Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="form_created">Form Created</SelectItem>
                                    <SelectItem value="form_submitted">Form Submitted</SelectItem>
                                    <SelectItem value="task_created">Task Created</SelectItem>
                                    <SelectItem value="user_invited">User Invited</SelectItem>
                                    <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Select value={userFilter} onValueChange={setUserFilter}>
                                <SelectTrigger className="bg-[#0a0e17] border-blue-900/20 text-white">
                                    <SelectValue placeholder="User" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.email}>
                                            {user.full_name || user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger className="bg-[#0a0e17] border-blue-900/20 text-white">
                                    <SelectValue placeholder="Date Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Last 24 hours</SelectItem>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                    <SelectItem value="90">Last 90 days</SelectItem>
                                    <SelectItem value="all">All time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400">Total Activities</p>
                                    <p className="text-2xl font-bold text-white mt-1">{filteredLogs.length}</p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-400/50" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400">Active Users</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {new Set(filteredLogs.map(l => l.user_email)).size}
                                    </p>
                                </div>
                                <Users className="w-8 h-8 text-green-400/50" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400">Today's Activities</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {filteredLogs.filter(l => 
                                            format(parseISO(l.created_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                                        ).length}
                                    </p>
                                </div>
                                <Activity className="w-8 h-8 text-[#FF8C00]/50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Activity List */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="text-center py-12 text-blue-400">Loading activities...</div>
                        ) : filteredLogs.length > 0 ? (
                            <div className="divide-y divide-blue-900/20">
                                {filteredLogs.map((log, idx) => {
                                    const Icon = ACTION_ICONS[log.action_type] || Activity;
                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="p-4 hover:bg-blue-950/20 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div>
                                                            <p className="text-white font-medium">{log.description}</p>
                                                            {log.entity_title && (
                                                                <p className="text-sm text-blue-400/70 mt-1">
                                                                    {log.entity_title}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge variant="outline" className={getActionColor(log.action_type)}>
                                                            {log.action_type.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-blue-400/70">
                                                        <span>{log.user_name || log.user_email}</span>
                                                        <span>•</span>
                                                        <span>{format(parseISO(log.created_date), 'PPp')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-blue-400/60">
                                No activities found matching your filters
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ActivityLog() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']}>
            <ActivityLogContent />
        </RoleGuard>
    );
}