import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Bell, Wifi, WifiOff, Save, Trash2, Zap, Activity } from 'lucide-react';
import { useUserRole } from '@/components/auth/RoleGuard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
    const queryClient = useQueryClient();
    const { canManage } = useUserRole();
    const [offlineEnabled, setOfflineEnabled] = useState(false);
    const [cacheSize, setCacheSize] = useState(0);
    
    const { data: settings } = useQuery({
        queryKey: ['notification-settings'],
        queryFn: async () => {
            const allSettings = await base44.entities.NotificationSettings.list();
            return allSettings[0];
        }
    });
    
    const [notifications, setNotifications] = useState({
        form_submissions: true,
        checklist_completion: true,
        daily_summary: false,
        overdue_items: true,
        email_notifications: true
    });
    
    useEffect(() => {
        if (settings) {
            setNotifications(settings);
        }
    }, [settings]);
    
    useEffect(() => {
        const enabled = localStorage.getItem('offlineMode') === 'true';
        setOfflineEnabled(enabled);
        calculateCacheSize();
    }, []);
    
    const calculateCacheSize = () => {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('offline_')) {
                total += localStorage[key].length;
            }
        }
        setCacheSize(Math.round(total / 1024));
    };
    
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (settings?.id) {
                return base44.entities.NotificationSettings.update(settings.id, data);
            }
            return base44.entities.NotificationSettings.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notification-settings']);
        }
    });
    
    const toggleOfflineMode = async () => {
        const newState = !offlineEnabled;
        setOfflineEnabled(newState);
        localStorage.setItem('offlineMode', String(newState));
        
        if (newState) {
            // Cache data for offline use
            const forms = await base44.entities.FormTemplate.filter({ status: 'active' });
            const checklists = await base44.entities.ChecklistTemplate.filter({ status: 'active' });
            const categories = await base44.entities.Category.list();
            
            localStorage.setItem('offline_forms', JSON.stringify(forms));
            localStorage.setItem('offline_checklists', JSON.stringify(checklists));
            localStorage.setItem('offline_categories', JSON.stringify(categories));
            localStorage.setItem('offline_timestamp', new Date().toISOString());
            
            calculateCacheSize();
        }
    };
    
    const clearCache = () => {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_'));
        keys.forEach(key => localStorage.removeItem(key));
        setCacheSize(0);
        setOfflineEnabled(false);
        localStorage.setItem('offlineMode', 'false');
    };
    
    const handleSaveNotifications = () => {
        saveMutation.mutate(notifications);
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Settings</h1>
                            <p className="text-sm text-blue-400">Configure your preferences</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Offline Mode */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            {offlineEnabled ? <Wifi className="w-5 h-5 text-blue-500" /> : <WifiOff className="w-5 h-5 text-blue-700" />}
                            Offline Mode
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Download forms and checklists for offline access
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <Label className="text-blue-100">Enable Offline Mode</Label>
                                <p className="text-sm text-blue-400/70 mt-1">Access forms without internet connection</p>
                            </div>
                            <Switch
                                checked={offlineEnabled}
                                onCheckedChange={toggleOfflineMode}
                            />
                        </div>
                        
                        {offlineEnabled && (
                            <div className="pt-4 border-t border-blue-900/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-300">Cache Size</span>
                                    <Badge className="bg-blue-950/50 text-blue-300">{cacheSize} KB</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-300">Last Synced</span>
                                    <span className="text-sm text-blue-400">
                                        {localStorage.getItem('offline_timestamp') 
                                            ? new Date(localStorage.getItem('offline_timestamp')).toLocaleString()
                                            : 'Never'}
                                    </span>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={clearCache}
                                    className="w-full border-red-800 text-red-400 hover:bg-red-950/50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear Cache
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Notifications */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-500" />
                            Notifications
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Customize what notifications you receive
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-blue-100">Form Submissions</Label>
                                <p className="text-sm text-blue-400/70 mt-1">Get notified when forms are submitted</p>
                            </div>
                            <Switch
                                checked={notifications.form_submissions}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, form_submissions: checked }))}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-blue-100">Checklist Completion</Label>
                                <p className="text-sm text-blue-400/70 mt-1">Get notified when checklists are completed</p>
                            </div>
                            <Switch
                                checked={notifications.checklist_completion}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, checklist_completion: checked }))}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-blue-100">Daily Summary</Label>
                                <p className="text-sm text-blue-400/70 mt-1">Receive daily activity summary</p>
                            </div>
                            <Switch
                                checked={notifications.daily_summary}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, daily_summary: checked }))}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-blue-100">Overdue Items</Label>
                                <p className="text-sm text-blue-400/70 mt-1">Alert when items are overdue</p>
                            </div>
                            <Switch
                                checked={notifications.overdue_items}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, overdue_items: checked }))}
                            />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-blue-100">Email Notifications</Label>
                                <p className="text-sm text-blue-400/70 mt-1">Send notifications to your email</p>
                            </div>
                            <Switch
                                checked={notifications.email_notifications}
                                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_notifications: checked }))}
                            />
                        </div>
                        
                        <Button 
                            onClick={handleSaveNotifications}
                            disabled={saveMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Preferences
                        </Button>
                    </CardContent>
                </Card>
                
                {/* Automation Management */}
                {canManage && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-500" />
                                Automation
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                Configure automated workflows and triggers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('ManageAutomations')}>
                                <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 hover:bg-blue-950/50">
                                    Manage Automation Rules
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
                
                {/* Activity Log */}
                {canManage && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Activity Log
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                View audit trail of all system activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('ActivityLog')}>
                                <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 hover:bg-blue-950/50">
                                    View Activity Log
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}