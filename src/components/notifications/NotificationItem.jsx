import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    CheckSquare, 
    FileText, 
    AlertCircle, 
    FolderOpen,
    ListTodo 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NotificationItem({ notification, onClose }) {
    const queryClient = useQueryClient();
    
    const markReadMutation = useMutation({
        mutationFn: () => httpClient.entities.Notification.update(notification.id, { read: true }),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });
    
    const handleClick = () => {
        if (!notification.read) {
            markReadMutation.mutate();
        }
        onClose();
    };
    
    const icons = {
        task_assigned: ListTodo,
        task_due_soon: AlertCircle,
        form_submitted: FileText,
        checklist_completed: CheckSquare,
        document_uploaded: FolderOpen
    };
    
    const colors = {
        task_assigned: 'text-blue-600 bg-blue-50',
        task_due_soon: 'text-red-600 bg-red-50',
        form_submitted: 'text-green-600 bg-green-50',
        checklist_completed: 'text-purple-600 bg-purple-50',
        document_uploaded: 'text-orange-600 bg-orange-50'
    };
    
    const Icon = icons[notification.type] || ListTodo;
    const colorClass = colors[notification.type] || 'text-blue-300 bg-blue-950/40';
    
    const linkUrl = notification.link_page 
        ? createPageUrl(`${notification.link_page}${notification.link_params || ''}`)
        : null;
    
    const content = (
        <div 
            className={cn(
                "flex gap-3 p-4 hover:bg-blue-950/40 transition-colors cursor-pointer",
                !notification.read && "bg-blue-50/50"
            )}
            onClick={handleClick}
        >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-white">
                        {notification.title}
                    </p>
                    {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                    )}
                </div>
                <p className="text-sm text-blue-300 mt-1 line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-xs text-blue-400/60 mt-1">
                    {format(new Date(notification.created_date), 'MMM d, h:mm a')}
                </p>
            </div>
        </div>
    );
    
    if (linkUrl) {
        return <Link to={linkUrl}>{content}</Link>;
    }
    
    return content;
}