import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Bell, CheckSquare, FileText, AlertCircle, Calendar } from 'lucide-react';

const NOTIFICATION_ICONS = {
    task_assigned: CheckSquare,
    task_due_soon: Calendar,
    form_submitted: FileText,
    checklist_completed: CheckSquare,
    document_uploaded: FileText,
    audit_alert: AlertCircle
};

export function useRealtimeNotifications() {
    const queryClient = useQueryClient();
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            return base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 50);
        },
        enabled: !!user?.email,
        refetchInterval: 10000, // Poll every 10 seconds
        refetchIntervalInBackground: false
    });

    const { data: notificationSettings } = useQuery({
        queryKey: ['notification-settings', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const settings = await base44.entities.NotificationSettings.filter({ created_by: user.email });
            return settings[0] || {
                form_submissions: true,
                checklist_completion: true,
                daily_summary: false,
                overdue_items: true,
                email_notifications: true
            };
        },
        enabled: !!user?.email
    });

    useEffect(() => {
        if (!notifications || notifications.length === 0) return;

        const lastNotification = notifications[0];
        const lastSeenTime = localStorage.getItem('last_notification_time');
        const currentTime = new Date(lastNotification.created_date).getTime();

        if (!lastSeenTime || currentTime > parseInt(lastSeenTime)) {
            // New notification detected
            const Icon = NOTIFICATION_ICONS[lastNotification.type] || Bell;
            
            toast(lastNotification.title, {
                description: lastNotification.message,
                icon: <Icon className="w-4 h-4" />,
                action: lastNotification.link_page ? {
                    label: 'View',
                    onClick: () => {
                        const url = lastNotification.link_params 
                            ? `${lastNotification.link_page}?${lastNotification.link_params}`
                            : lastNotification.link_page;
                        window.location.href = `/app/${url}`;
                    }
                } : undefined,
                duration: 5000
            });

            localStorage.setItem('last_notification_time', currentTime.toString());
        }
    }, [notifications]);

    const markAsRead = async (notificationId) => {
        await base44.entities.Notification.update(notificationId, { read: true });
        queryClient.invalidateQueries(['notifications']);
    };

    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.read);
        await Promise.all(
            unreadNotifications.map(n => 
                base44.entities.Notification.update(n.id, { read: true })
            )
        );
        queryClient.invalidateQueries(['notifications']);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        notificationSettings
    };
}