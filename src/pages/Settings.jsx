import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Bell, Wifi, WifiOff, Save, Trash2, Zap, Activity, Shield, Building2, Book, TrendingUp, Sparkles, Smartphone, Lightbulb, HelpCircle, Rocket, ClipboardCheck } from 'lucide-react';
import AppPermissions from '@/components/settings/AppPermissions';
import { TourTrigger } from '@/components/tutorial/OnboardingTour';
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
        <div className="min-h-screen bg-[#0a0e17] overflow-y-auto">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20 shadow-sm">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
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
                {/* App Permissions */}
                <AppPermissions />

                {/* Experience Level */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white">Experience Level</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { value: 'senior', label: 'Extra Large & Simple' },
                            { value: 'simple', label: 'Simple & Easy' },
                            { value: 'beginner', label: 'Some Guidance' },
                            { value: 'intermediate', label: 'I Know Apps' },
                            { value: 'expert', label: 'Full Features' }
                        ].map((level) => (
                            <button
                                key={level.value}
                                onClick={() => setTechnicalLevel(level.value)}
                                className={`w-full p-3 rounded-lg font-medium transition-all text-left ${
                                    technicalLevel === level.value
                                        ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white'
                                        : 'bg-[#0a0e17] text-blue-300 border border-blue-900/30'
                                }`}
                            >
                                {level.label}
                            </button>
                        ))}

                        {hasUnsavedChanges && (
                            <Button
                                onClick={applyChanges}
                                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] h-12 mt-4"
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

                {/* External Integrations */}
                {canManage && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-purple-500" />
                                External Integrations
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                Connect to external services via REST, GraphQL, WebSocket, and more
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('Integrations')}>
                                <Button variant="outline" className="w-full border-purple-900/30 text-purple-300 hover:bg-purple-950/50">
                                    Manage Integrations
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
                
                {/* Plans & Billing */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#FF8C00]" />
                            Plans & Billing
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Manage subscription, upgrade plans, and view billing
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link to={createPageUrl('Pricing')}>
                            <Button className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                View Plans & Upgrade
                            </Button>
                        </Link>
                        <Link to={createPageUrl('CustomerPortal')}>
                            <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 hover:bg-blue-950/50">
                                Billing & Analytics
                            </Button>
                        </Link>
                        <Link to={createPageUrl('OrganizationSettings')}>
                            <Button variant="ghost" className="w-full text-blue-400 hover:bg-blue-950/30 text-sm">
                                Organization Settings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* AI Assistant */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#FF8C00]" />
                            AI Assistant
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Create workflows, summarize documents, get smart suggestions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to={createPageUrl('AIAssistantPage')}>
                            <Button variant="outline" className="w-full border-[#FF8C00]/30 text-[#FF8C00] hover:bg-[#FF8C00]/10">
                                Open AI Assistant
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Documentation */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Book className="w-5 h-5 text-blue-400" />
                            User Documentation
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Guides, tutorials, and FAQs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to={createPageUrl('Documentation')}>
                            <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 hover:bg-blue-950/50">
                                View Documentation
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

                {/* Admin Dashboard */}
                {isAdmin && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#FF8C00]" />
                                Admin Dashboard
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                System overview and management console
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link to={createPageUrl('OversightDashboard')}>
                                <Button className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                    Open Oversight Dashboard
                                </Button>
                            </Link>
                            <Link to={createPageUrl('AdminDashboard')}>
                                <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 hover:bg-blue-950/50">
                                    Legacy Dashboard
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

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

                {/* Data Export */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-500" />
                            Export Data
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Download a complete copy of your data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to={createPageUrl('ExportData')}>
                            <Button variant="outline" className="w-full border-green-900/30 text-green-300 hover:bg-green-950/50">
                                Export My Data
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Mobile Readiness */}
                <Card className="bg-[#0f1419] border-[#FF8C00]/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-[#FF8C00]" />
                            Publish to Android
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Step-by-step guide for Android / Google Play publishing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to={createPageUrl('MobileReadiness')}>
                            <Button className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                Open Mobile Readiness Guide
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* App Tour */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-400" />
                            App Walkthrough
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Replay the onboarding tour to learn key features
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TourTrigger className="w-full justify-center py-2 border border-yellow-900/30 rounded-lg hover:bg-yellow-950/20" />
                    </CardContent>
                </Card>

                {/* Support */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-500" />
                            Support
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Get help or report an issue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to={createPageUrl('Support')}>
                            <Button variant="outline" className="w-full border-purple-900/30 text-purple-300 hover:bg-purple-950/50">
                                Contact Support
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* System Health - Admin Only */}
                {isAdmin && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-red-400" />
                                System Health
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                Monitor errors and system status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('SystemHealth')}>
                                <Button variant="outline" className="w-full border-red-900/30 text-red-300 hover:bg-red-950/50">
                                    View System Health
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Billing Tests - Admin Only */}
                {isAdmin && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                Billing Tests
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                Test Stripe integration flow
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('BillingTest')}>
                                <Button variant="outline" className="w-full border-green-900/30 text-green-300 hover:bg-green-950/50">
                                    Run Billing Tests
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Production Checklist - Admin Only */}
                {isAdmin && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#FF8C00]" />
                                Production Checklist
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                Track readiness for production launch
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('ProductionChecklist')}>
                                <Button variant="outline" className="w-full border-[#FF8C00]/30 text-[#FF8C00] hover:bg-[#FF8C00]/10">
                                    View Checklist
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Load Testing - Admin Only */}
                {isAdmin && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                Load Testing
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                Simulate concurrent users and test performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('LoadTesting')}>
                                <Button variant="outline" className="w-full border-purple-900/30 text-purple-300 hover:bg-purple-950/50">
                                    Run Load Tests
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Setup Wizard */}
                <Card className="bg-[#0f1419] border-[#FF8C00]/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Rocket className="w-5 h-5 text-[#FF8C00]" />
                            Setup Wizard
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Step-by-step guided setup for new workspaces
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to={createPageUrl('SetupWizard')}>
                            <Button className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                Launch Setup Wizard
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Help & FAQ */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-blue-400" />
                            Help & FAQ
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                            Answers for every feature — forms, tasks, documents, automations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to={createPageUrl('HelpFAQ')}>
                            <Button variant="outline" className="w-full border-blue-900/30 text-blue-300 hover:bg-blue-950/50">
                                Browse Help & FAQ
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* App Audit */}
                {isAdmin && (
                    <Card className="bg-[#0f1419] border-emerald-900/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                                Pre-Launch App Audit
                            </CardTitle>
                            <CardDescription className="text-blue-400">
                                Full end-to-end smoke test — auth, entities, AI, routes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to={createPageUrl('AppAudit')}>
                                <Button variant="outline" className="w-full border-emerald-900/30 text-emerald-300 hover:bg-emerald-950/50">
                                    Run App Audit
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}