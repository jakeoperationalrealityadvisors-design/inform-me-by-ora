import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Users, Building2, FileText, CheckSquare, ClipboardList, AlertCircle, TrendingUp, Activity, Zap, Shield, CreditCard } from 'lucide-react';
import AdminBillingPanel from '@/components/billing/AdminBillingPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RoleGuard from '@/components/auth/RoleGuard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#FF8C00', '#1E40AF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function AdminDashboardContent() {
    const { data: users = [] } = useQuery({
        queryKey: ['all-users'],
        queryFn: () => base44.asServiceRole.entities.User.list()
    });

    const { data: organizations = [] } = useQuery({
        queryKey: ['all-orgs'],
        queryFn: () => base44.entities.Organization.list()
    });

    const { data: forms = [] } = useQuery({
        queryKey: ['all-forms'],
        queryFn: () => base44.entities.FormTemplate.list()
    });

    const { data: checklists = [] } = useQuery({
        queryKey: ['all-checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.list()
    });

    const { data: formSubmissions = [] } = useQuery({
        queryKey: ['all-form-submissions'],
        queryFn: () => base44.entities.FormSubmission.list('-created_date', 100)
    });

    const { data: checklistSubmissions = [] } = useQuery({
        queryKey: ['all-checklist-submissions'],
        queryFn: () => base44.entities.ChecklistSubmission.list('-created_date', 100)
    });

    const { data: errors = [] } = useQuery({
        queryKey: ['recent-errors'],
        queryFn: () => base44.entities.ErrorLog.filter({ resolved: false }, '-created_date', 10)
    });

    const { data: activities = [] } = useQuery({
        queryKey: ['recent-activities'],
        queryFn: () => base44.entities.ActivityLog.list('-created_date', 20)
    });

    const { data: automations = [] } = useQuery({
        queryKey: ['all-automations'],
        queryFn: () => base44.entities.AutomationRule.list()
    });

    // Calculate metrics
    const totalSubmissions = formSubmissions.length + checklistSubmissions.length;
    const activeOrgs = organizations.filter(o => o.status === 'active').length;
    const verifiedUsers = users.filter(u => u.email_verified).length;
    const unverifiedUsers = users.length - verifiedUsers;
    const activeAutomations = automations.filter(a => a.enabled).length;

    // Submissions by day (last 7 days)
    const submissionsByDay = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const daySubmissions = [...formSubmissions, ...checklistSubmissions].filter(s => {
            const submissionDate = new Date(s.created_date);
            return submissionDate.toDateString() === date.toDateString();
        });

        submissionsByDay.push({
            date: dateStr,
            submissions: daySubmissions.length
        });
    }

    // Organizations by plan
    const orgsByPlan = organizations.reduce((acc, org) => {
        const plan = org.plan_type || 'trial';
        acc[plan] = (acc[plan] || 0) + 1;
        return acc;
    }, {});

    const planData = Object.entries(orgsByPlan).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    // User verification status
    const userVerificationData = [
        { name: 'Verified', value: verifiedUsers },
        { name: 'Unverified', value: unverifiedUsers }
    ];

    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <Link to={createPageUrl('Settings')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                    <p className="text-blue-400">System overview and management</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400 mb-1">Total Users</p>
                                    <p className="text-3xl font-bold text-white">{users.length}</p>
                                </div>
                                <Users className="w-10 h-10 text-blue-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400 mb-1">Organizations</p>
                                    <p className="text-3xl font-bold text-white">{organizations.length}</p>
                                    <p className="text-xs text-green-400">{activeOrgs} active</p>
                                </div>
                                <Building2 className="w-10 h-10 text-[#FF8C00] opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400 mb-1">Templates</p>
                                    <p className="text-3xl font-bold text-white">{forms.length + checklists.length}</p>
                                    <p className="text-xs text-blue-400">{forms.length} forms, {checklists.length} checklists</p>
                                </div>
                                <FileText className="w-10 h-10 text-green-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-400 mb-1">Submissions</p>
                                    <p className="text-3xl font-bold text-white">{totalSubmissions}</p>
                                    <p className="text-xs text-blue-400">Last 100 records</p>
                                </div>
                                <ClipboardList className="w-10 h-10 text-purple-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Submissions Trend */}
                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-white">Submissions (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={submissionsByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e40af33" />
                                    <XAxis dataKey="date" stroke="#60a5fa" />
                                    <YAxis stroke="#60a5fa" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #1e40af' }}
                                        labelStyle={{ color: '#60a5fa' }}
                                    />
                                    <Line type="monotone" dataKey="submissions" stroke="#FF8C00" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Organizations by Plan */}
                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-white">Organizations by Plan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={planData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {planData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #1e40af' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Unresolved Errors */}
                    <Card className="bg-[#0f1419] border-red-900/30">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                Unresolved Errors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-400 mb-2">{errors.length}</div>
                            <Link to={createPageUrl('SystemHealth')}>
                                <Button variant="outline" size="sm" className="border-red-900/30 text-red-300">
                                    View Details
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Active Automations */}
                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-[#FF8C00]" />
                                Active Automations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#FF8C00] mb-2">{activeAutomations}/{automations.length}</div>
                            <Link to={createPageUrl('ManageAutomations')}>
                                <Button variant="outline" size="sm" className="border-blue-900/30 text-blue-300">
                                    Manage Rules
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Unverified Users */}
                    <Card className="bg-[#0f1419] border-yellow-900/30">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-yellow-400" />
                                Unverified Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-400 mb-2">{unverifiedUsers}</div>
                            <Link to={createPageUrl('UserManagement')}>
                                <Button variant="outline" size="sm" className="border-yellow-900/30 text-yellow-300">
                                    View Users
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-[#0f1419] border-blue-900/30 mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Recent Activity</CardTitle>
                            <Link to={createPageUrl('ActivityLog')}>
                                <Button variant="ghost" size="sm" className="text-blue-400">
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activities.slice(0, 10).map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 bg-[#0a0e17] rounded-lg border border-blue-900/30">
                                    <Activity className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-white text-sm">{activity.description}</p>
                                        <p className="text-xs text-blue-400 mt-1">
                                            {activity.user_name} • {new Date(activity.created_date).toLocaleString()}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {activity.action_type.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Panel */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#FF8C00]" /> Billing Overview
                    </h2>
                    <AdminBillingPanel />
                </div>

                {/* Quick Actions */}
                <Card className="bg-[#0f1419] border-blue-900/30">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link to={createPageUrl('UserManagement')}>
                            <Button variant="outline" className="w-full border-blue-900/30">
                                <Users className="w-4 h-4 mr-2" />
                                Users
                            </Button>
                        </Link>
                        <Link to={createPageUrl('RoleManagement')}>
                            <Button variant="outline" className="w-full border-blue-900/30">
                                <Shield className="w-4 h-4 mr-2" />
                                Roles
                            </Button>
                        </Link>
                        <Link to={createPageUrl('ManageAutomations')}>
                            <Button variant="outline" className="w-full border-blue-900/30">
                                <Zap className="w-4 h-4 mr-2" />
                                Automations
                            </Button>
                        </Link>
                        <Link to={createPageUrl('SystemHealth')}>
                            <Button variant="outline" className="w-full border-blue-900/30">
                                <Activity className="w-4 h-4 mr-2" />
                                System Health
                            </Button>
                        </Link>
                        <Link to={createPageUrl('ActivityLog')}>
                            <Button variant="outline" className="w-full border-blue-900/30">
                                <Activity className="w-4 h-4 mr-2" />
                                Activity Log
                            </Button>
                        </Link>
                        <Link to={createPageUrl('Reports')}>
                            <Button variant="outline" className="w-full border-blue-900/30">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Reports
                            </Button>
                        </Link>
                        <Link to={createPageUrl('BillingTest')}>
                            <Button variant="outline" className="w-full border-blue-900/30">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Billing Tests
                            </Button>
                        </Link>
                        <Link to={createPageUrl('LoadTesting')}>
                            <Button variant="outline" className="w-full border-blue-900/30">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Load Tests
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <AdminDashboardContent />
        </RoleGuard>
    );
}