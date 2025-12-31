import React, { useState } from 'react';
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
import { useRealtimeNotifications } from './useRealtimeNotifications';

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { notifications, unreadCount, markAllAsRead } = useRealtimeNotifications();
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative rounded-full hover:bg-blue-900/30 text-[#FF8C00]"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-[#0f1419] border-blue-900/20" align="end">
                <div className="flex items-center justify-between p-4 border-b border-blue-900/20">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-blue-900/20">
                            {notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClose={() => setOpen(false)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-blue-400/60">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-blue-400/30" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}