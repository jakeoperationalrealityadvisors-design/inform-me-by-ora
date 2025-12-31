import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationItem from './NotificationItem';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', user?.email],
        queryFn: () => base44.entities.Notification.filter(
            { user_email: user?.email },
            '-created_date',
            50
        ),
        enabled: !!user?.email,
        refetchInterval: 30000 // Refetch every 30 seconds
    });
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
            await Promise.all(
                unreadIds.map(id => base44.entities.Notification.update(id, { read: true }))
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full hover:bg-slate-100 text-slate-600"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllReadMutation.mutate()}
                            className="text-xs text-blue-600 hover:text-blue-700"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClose={() => setOpen(false)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}