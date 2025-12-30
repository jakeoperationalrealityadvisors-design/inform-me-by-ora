import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Bell } from 'lucide-react';
import { differenceInDays, differenceInHours, isPast, isToday } from 'date-fns';

export default function TaskReminderBadge({ dueDate }) {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const daysDiff = differenceInDays(due, now);
    const hoursDiff = differenceInHours(due, now);
    
    if (isPast(due) && !isToday(due)) {
        return (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Overdue
            </Badge>
        );
    }
    
    if (isToday(due) || hoursDiff <= 24) {
        return (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                <Bell className="w-3 h-3 mr-1" />
                Due Today
            </Badge>
        );
    }
    
    if (daysDiff <= 3) {
        return (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <Clock className="w-3 h-3 mr-1" />
                Due in {daysDiff}d
            </Badge>
        );
    }
    
    return null;
}