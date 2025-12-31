import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import RoleGuard from '@/components/auth/RoleGuard';
import AuditLogViewer from '@/components/audit/AuditLogViewer';
import AuditFilters from '@/components/audit/AuditFilters';
import AuditExporter from '@/components/audit/AuditExporter';
import { subDays } from 'date-fns';

function ActivityLogContent() {
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date()
    });
    const [selectedUser, setSelectedUser] = useState('all');
    const [selectedAction, setSelectedAction] = useState('all');

    const { data: logs = [], isLoading, refetch } = useQuery({
        queryKey: ['activity-logs'],
        queryFn: () => base44.entities.ActivityLog.list('-created_date', 5000),
        staleTime: 30000
    });

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list()
    });

    const filteredLogs = logs.filter(log => {
        const matchesSearch = !search || 
            log.description?.toLowerCase().includes(search.toLowerCase()) ||
            log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
            log.user_name?.toLowerCase().includes(search.toLowerCase()) ||
            log.entity_title?.toLowerCase().includes(search.toLowerCase());
        
        const matchesDate = !dateRange.from || !dateRange.to || (
            new Date(log.created_date) >= dateRange.from &&
            new Date(log.created_date) <= dateRange.to
        );
        
        const matchesUser = selectedUser === 'all' || log.user_email === selectedUser;
        const matchesAction = selectedAction === 'all' || log.action_type === selectedAction;
        
        return matchesSearch && matchesDate && matchesUser && matchesAction;
    });

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-[#FF8C00]" />
                                    Audit Trail
                                </h1>
                                <p className="text-sm text-blue-300">
                                    Comprehensive activity and security logs
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => refetch()}
                                variant="outline"
                                size="icon"
                                className="text-blue-400"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <AuditExporter 
                                logs={filteredLogs}
                                dateRange={dateRange}
                                filters={{
                                    user: selectedUser,
                                    action: selectedAction,
                                    search
                                }}
                            />
                        </div>
                    </div>

                    <AuditFilters
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        selectedUser={selectedUser}
                        onUserChange={setSelectedUser}
                        selectedAction={selectedAction}
                        onActionChange={setSelectedAction}
                        searchTerm={search}
                        onSearchChange={setSearch}
                        users={users}
                    />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#0f1419] border border-blue-900/20 rounded-lg p-4">
                        <p className="text-xs text-blue-400 mb-1">Total Entries</p>
                        <p className="text-2xl font-bold text-white">{filteredLogs.length}</p>
                    </div>
                    <div className="bg-[#0f1419] border border-blue-900/20 rounded-lg p-4">
                        <p className="text-xs text-blue-400 mb-1">Unique Users</p>
                        <p className="text-2xl font-bold text-white">
                            {new Set(filteredLogs.map(l => l.user_email)).size}
                        </p>
                    </div>
                    <div className="bg-[#0f1419] border border-blue-900/20 rounded-lg p-4">
                        <p className="text-xs text-blue-400 mb-1">Action Types</p>
                        <p className="text-2xl font-bold text-white">
                            {new Set(filteredLogs.map(l => l.action_type)).size}
                        </p>
                    </div>
                    <div className="bg-[#0f1419] border border-blue-900/20 rounded-lg p-4">
                        <p className="text-xs text-blue-400 mb-1">Today's Activity</p>
                        <p className="text-2xl font-bold text-white">
                            {filteredLogs.filter(l => {
                                const today = new Date();
                                const logDate = new Date(l.created_date);
                                return logDate.toDateString() === today.toDateString();
                            }).length}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-12 text-blue-400">Loading audit logs...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12 text-blue-400/60 bg-[#0f1419] rounded-lg border border-blue-900/20">
                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No audit logs found matching the filters</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <AuditLogViewer key={log.id} log={log} />
                        ))
                    )}
                </div>
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