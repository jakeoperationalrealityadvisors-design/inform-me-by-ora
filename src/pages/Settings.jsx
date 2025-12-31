import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Bell, Wifi, WifiOff, Save, Trash2, Zap, Activity, Shield, Building2, Book, TrendingUp } from 'lucide-react';
import { useUserRole } from '@/components/auth/RoleGuard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import { toast } from 'sonner';

export default function Settings() {
    const queryClient = useQueryClient();
    const { canManage, isAdmin, user } = useUserRole();
    const [offlineEnabled, setOfflineEnabled] = useState(false);
    const [cacheSize, setCacheSize] = useState(0);
    const [technicalLevel, setTechnicalLevel] = useState(user?.technical_level || 'intermediate');
    
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
    
    const hasUnsavedChanges = technicalLevel !== user?.technical_level;
    
    const applyChanges = async () => {
        await base44.auth.updateMe({ 
            technical_level: technicalLevel,
            preferred_tutorial_style: technicalLevel === 'expert' ? 'none' : 'tooltips'
        });
        queryClient.invalidateQueries(['current-user']);
        toast.success('Settings saved successfully');
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
                {/* Experience Level */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#FF8C00]" />
                            Experience Level
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Adjust how much guidance and help you receive
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { value: 'senior', label: 'Extra Large & Simple', emoji: '👴', desc: 'Very large buttons, plain English, one step at a time' },
                            { value: 'simple', label: 'Simple & Easy', emoji: '🌟', desc: 'Large buttons, simple words, step-by-step' },
                            { value: 'beginner', label: 'Some Guidance', emoji: '📚', desc: 'Clear instructions and helpful tips' },
                            { value: 'intermediate', label: 'I Know Apps', emoji: '💡', desc: 'Just show me what\'s different' },
                            { value: 'expert', label: 'Full Features', emoji: '⚡', desc: 'Everything available' }
                        ].map((level) => (
                            <button
                                key={level.value}
                                onClick={() => setTechnicalLevel(level.value)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                                    technicalLevel === level.value
                                        ? 'border-[#FF8C00] bg-gradient-to-r from-orange-950/30 to-blue-950/30'
                                        : 'border-blue-900/20 hover:border-blue-700/30'
                                }`}
                            >
                                <div className="text-2xl">{level.emoji}</div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">{level.label}</div>
                                    <div className="text-xs text-blue-400">{level.desc}</div>
                                </div>
                                {technicalLevel === level.value && (
                                    <div className="text-[#FF8C00]">✓</div>
                                )}
                            </button>
                        ))}

                        {hasUnsavedChanges && (
                            <Button
                                onClick={applyChanges}
                                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] h-12 text-base font-semibold"
                            >
                                Apply Changes
                            </Button>
                        )}
                    </CardContent>
                </Card>

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
                
                {/* Customer Portal */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#FF8C00]" />
                            Customer Portal
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Manage subscription, billing, and view analytics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link to={createPageUrl('CustomerPortal')}>
                            <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 hover:bg-blue-950/50">
                                Open Customer Portal
                            </Button>
                        </Link>
                        <Link to={createPageUrl('OrganizationSettings')}>
                            <Button variant="ghost" className="w-full text-blue-400 hover:bg-blue-950/30 text-sm">
                                Organization Settings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Knowledge Base */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Book className="w-5 h-5 text-purple-400" />
                            AI Knowledge Base
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Ask questions about app features, data, and processes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to={createPageUrl('KnowledgeBase')}>
                            <Button variant="outline" className="w-full border-purple-900/30 text-purple-300 hover:bg-purple-950/50">
                                Open Knowledge Base
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Role Management */}
                {isAdmin && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#FF8C00]" />
                                Role Management
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                Configure custom roles and permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('RoleManagement')}>
                                <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 hover:bg-blue-950/50">
                                    Manage Roles
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