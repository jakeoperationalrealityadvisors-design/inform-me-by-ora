import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Calendar, User, Activity } from 'lucide-react';

const ACTION_TYPES = [
    'all',
    'form_created', 'form_edited', 'form_deleted', 'form_submitted',
    'checklist_created', 'checklist_edited', 'checklist_deleted', 'checklist_submitted',
    'task_created', 'task_updated', 'task_completed', 'task_deleted',
    'user_invited', 'user_updated', 'user_deleted',
    'document_uploaded', 'document_deleted',
    'automation_created', 'automation_edited',
    'category_created', 'category_edited', 'category_deleted',
    'settings_changed'
];

export default function AuditFilters({ 
    dateRange, 
    onDateRangeChange,
    selectedUser,
    onUserChange,
    selectedAction,
    onActionChange,
    searchTerm,
    onSearchChange,
    users 
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <DatePickerWithRange
                    date={dateRange}
                    onDateChange={onDateRangeChange}
                    className="flex-1"
                />
            </div>

            <Select value={selectedUser} onValueChange={onUserChange}>
                <SelectTrigger className="bg-[#0f1419] border-blue-900/20 text-white">
                    <User className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Users" />
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

            <Select value={selectedAction} onValueChange={onActionChange}>
                <SelectTrigger className="bg-[#0f1419] border-blue-900/20 text-white">
                    <Activity className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                    {ACTION_TYPES.map(action => (
                        <SelectItem key={action} value={action}>
                            {action === 'all' ? 'All Actions' : action.replace(/_/g, ' ')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-[#0f1419] border-blue-900/20 text-white"
            />
        </div>
    );
}