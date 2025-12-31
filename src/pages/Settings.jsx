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
import NotificationPreferences from '@/components/notifications/NotificationPreferences';

export default function Settings() {
    const queryClient = useQueryClient();
    const { canManage } = useUserRole();
    const [offlineEnabled, setOfflineEnabled] = useState(false);
    const [cacheSize, setCacheSize] = useState(0);
    
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
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
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
            
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
                
                {/* Notification Preferences */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#FF8C00]" />
                        Notification Preferences
                    </h2>
                    <NotificationPreferences />
                </div>
                
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