import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export function usePushNotifications() {
    const [permission, setPermission] = useState(Notification.permission);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('Notifications not supported');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            
            if (result === 'granted') {
                toast.success('Notifications enabled');
                return true;
            } else {
                toast.error('Notification permission denied');
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    const showNotification = (title, options = {}) => {
        if (permission === 'granted') {
            const notification = new Notification(title, {
                icon: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6954526c42ec916a050b905d/d38d72306_file_00000000ab1471f5a410df212e51129f1.png',
                badge: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6954526c42ec916a050b905d/d38d72306_file_00000000ab1471f5a410df212e51129f1.png',
                vibrate: [200, 100, 200],
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        }
    };

    return {
        permission,
        isSupported: 'Notification' in window,
        requestPermission,
        showNotification
    };
}

export default function PushNotificationToggle() {
    const { permission, isSupported, requestPermission } = usePushNotifications();

    if (!isSupported) return null;

    return (
        <Button
            onClick={requestPermission}
            variant="ghost"
            size="icon"
            className="rounded-full"
            disabled={permission === 'granted'}
        >
            {permission === 'granted' ? (
                <Bell className="w-5 h-5 text-green-500" />
            ) : (
                <BellOff className="w-5 h-5 text-slate-400" />
            )}
        </Button>
    );
}