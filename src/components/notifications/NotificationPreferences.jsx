import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationPreferences() {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState({
        form_submissions: true,
        checklist_completion: true,
        task_assignments: true,
        task_due_soon: true,
        overdue_items: true,
        document_uploads: true,
        audit_alerts: true,
        email_notifications: true,
        push_notifications: true,
        daily_summary: false,
        weekly_report: false
    });

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: existingSettings, isLoading } = useQuery({
        queryKey: ['notification-settings', user?.email],
        queryFn: async () => {
            if (!user?.email) return null;
            const result = await base44.entities.NotificationSettings.filter({ 
                created_by: user.email 
            });
            return result[0] || null;
        },
        enabled: !!user?.email,
        onSuccess: (data) => {
            if (data) {
                setSettings(prev => ({ ...prev, ...data }));
            }
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (newSettings) => {
            if (existingSettings?.id) {
                return base44.entities.NotificationSettings.update(existingSettings.id, newSettings);
            } else {
                return base44.entities.NotificationSettings.create(newSettings);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notification-settings']);
            toast.success('Notification preferences saved', {
                icon: <CheckCircle2 className="w-4 h-4" />
            });
        },
        onError: () => {
            toast.error('Failed to save preferences', {
                icon: <AlertCircle className="w-4 h-4" />
            });
        }
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        saveMutation.mutate(settings);
    };

    if (isLoading) {
        return <div className="text-center py-8 text-blue-400">Loading preferences...</div>;
    }

    const notificationTypes = [
        {
            category: 'In-App Notifications',
            icon: Bell,
            settings: [
                { key: 'form_submissions', label: 'Form Submissions', description: 'Notify when forms are submitted' },
                { key: 'checklist_completion', label: 'Checklist Completion', description: 'Notify when checklists are completed' },
                { key: 'task_assignments', label: 'Task Assignments', description: 'Notify when tasks are assigned to you' },
                { key: 'task_due_soon', label: 'Upcoming Deadlines', description: 'Notify about tasks due in 24 hours' },
                { key: 'overdue_items', label: 'Overdue Items', description: 'Notify about overdue tasks' },
                { key: 'document_uploads', label: 'Document Uploads', description: 'Notify when documents are uploaded' },
                { key: 'audit_alerts', label: 'Security Alerts', description: 'Critical audit trail notifications' }
            ]
        },
        {
            category: 'Email Notifications',
            icon: Mail,
            settings: [
                { key: 'email_notifications', label: 'Enable Email Notifications', description: 'Receive notifications via email' },
                { key: 'daily_summary', label: 'Daily Summary', description: 'Daily digest of activities' },
                { key: 'weekly_report', label: 'Weekly Report', description: 'Weekly performance report' }
            ]
        },
        {
            category: 'Push Notifications',
            icon: Smartphone,
            settings: [
                { key: 'push_notifications', label: 'Enable Push Notifications', description: 'Receive notifications on mobile devices' }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            {notificationTypes.map(({ category, icon: Icon, settings: categorySettings }) => (
                <Card key={category} className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Icon className="w-5 h-5 text-[#FF8C00]" />
                            {category}
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Configure {category.toLowerCase()} preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {categorySettings.map(({ key, label, description }) => (
                            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-[#0a0e17] border border-blue-900/10">
                                <div className="flex-1">
                                    <Label htmlFor={key} className="text-white font-medium cursor-pointer">
                                        {label}
                                    </Label>
                                    <p className="text-sm text-blue-400/70 mt-1">{description}</p>
                                </div>
                                <Switch
                                    id={key}
                                    checked={settings[key] !== false}
                                    onCheckedChange={() => handleToggle(key)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saveMutation.isLoading}
                    className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black"
                >
                    {saveMutation.isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
            </div>
        </div>
    );
}