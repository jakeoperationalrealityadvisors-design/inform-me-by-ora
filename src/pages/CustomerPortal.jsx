import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CreditCard, TrendingUp, Users, FileText, CheckSquare, Zap, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionOverview from '@/components/portal/SubscriptionOverview';
import BillingHistory from '@/components/portal/BillingHistory';
import UsageMetrics from '@/components/portal/UsageMetrics';
import PlanManagement from '@/components/portal/PlanManagement';
import PortalAIInsights from '@/components/portal/PortalAIInsights';
import { format, subDays } from 'date-fns';

export default function CustomerPortal() {
    const [dateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date()
    });
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    const { data: organization } = useQuery({
        queryKey: ['organization', user?.organization_id],
        queryFn: () => base44.entities.Organization.filter({ id: user.organization_id }).then(r => r[0]),
        enabled: !!user?.organization_id
    });
    
    const { data: members = [] } = useQuery({
        queryKey: ['org-members', user?.organization_id],
        queryFn: () => base44.entities.User.filter({ organization_id: user.organization_id }),
        enabled: !!user?.organization_id
    });
    
    const { data: formSubmissions = [] } = useQuery({
        queryKey: ['portal-forms', dateRange],
        queryFn: () => base44.entities.FormSubmission.list('-created_date', 1000),
        enabled: !!user?.organization_id
    });
    
    const { data: checklistSubmissions = [] } = useQuery({
        queryKey: ['portal-checklists', dateRange],
        queryFn: () => base44.entities.ChecklistSubmission.list('-created_date', 1000),
        enabled: !!user?.organization_id
    });
    
    const { data: documents = [] } = useQuery({
        queryKey: ['portal-documents'],
        queryFn: () => base44.entities.Document.list('-created_date', 1000),
        enabled: !!user?.organization_id
    });
    
    const { data: automations = [] } = useQuery({
        queryKey: ['portal-automations'],
        queryFn: () => base44.entities.AutomationRule.list(),
        enabled: !!user?.organization_id
    });
    
    const isOwner = user?.team_role === 'owner';

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user.organization_id || !organization) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-[#0f1419] border border-orange-500/30 rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-5">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CreditCard className="w-7 h-7 text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-bold">Organization Setup Required</h2>
                        <p className="text-white/50 text-sm mt-2">You must complete organization setup before accessing the portal.</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Link to={createPageUrl('SetupWizard')}>
                            <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold">Complete Setup</Button>
                        </Link>
                        <Link to={createPageUrl('Home')}>
                            <Button variant="outline" className="border-white/20 text-white/70 hover:bg-white/5">Cancel</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Customer Portal</h1>
                                <p className="text-sm text-blue-400">{organization.name}</p>
                            </div>
                        </div>
                        {isOwner && (
                            <Link to={createPageUrl('OrganizationSettings')}>
                                <Button variant="outline" className="border-blue-600 text-blue-300">
                                    Organization Settings
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* AI Insights */}
                <PortalAIInsights
                    organization={organization}
                    members={members}
                    formSubmissions={formSubmissions}
                    checklistSubmissions={checklistSubmissions}
                    documents={documents}
                    automations={automations}
                    dateRange={dateRange}
                />
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400">Team Members</p>
                                    <p className="text-2xl font-bold text-white">
                                        {members.length}/{organization.max_users}
                                    </p>
                                </div>
                                <Users className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400">Submissions</p>
                                    <p className="text-2xl font-bold text-white">
                                        {formSubmissions.length + checklistSubmissions.length}
                                    </p>
                                </div>
                                <FileText className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400">Documents</p>
                                    <p className="text-2xl font-bold text-white">
                                        {documents.length}
                                    </p>
                                </div>
                                <FileText className="w-8 h-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400">Automations</p>
                                    <p className="text-2xl font-bold text-white">
                                        {automations.filter(a => a.enabled).length}
                                    </p>
                                </div>
                                <Zap className="w-8 h-8 text-[#FF8C00]" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Main Content Tabs */}
                <Tabs defaultValue="subscription" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-[#0f1419]">
                        <TabsTrigger value="subscription">Subscription</TabsTrigger>
                        <TabsTrigger value="usage">Usage</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                        <TabsTrigger value="plans">Plans</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="subscription" className="space-y-6">
                        <SubscriptionOverview organization={organization} members={members} />
                    </TabsContent>
                    
                    <TabsContent value="usage" className="space-y-6">
                        <UsageMetrics
                            organization={organization}
                            members={members}
                            formSubmissions={formSubmissions}
                            checklistSubmissions={checklistSubmissions}
                            documents={documents}
                            automations={automations}
                        />
                    </TabsContent>
                    
                    <TabsContent value="billing" className="space-y-6">
                        <BillingHistory organization={organization} />
                    </TabsContent>
                    
                    <TabsContent value="plans" className="space-y-6">
                        <PlanManagement organization={organization} isOwner={isOwner} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}