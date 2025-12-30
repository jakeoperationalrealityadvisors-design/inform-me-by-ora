import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, TrendingUp, FileText, CheckSquare, Users, Calendar, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import RoleGuard from '@/components/auth/RoleGuard';

export default function Reports() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']}>
            <ReportsContent />
        </RoleGuard>
    );
}

function ReportsContent() {
    const [timeRange, setTimeRange] = useState(7);
    
    const { data: formSubmissions = [] } = useQuery({
        queryKey: ['form-submissions'],
        queryFn: () => base44.entities.FormSubmission.list('-created_date')
    });
    
    const { data: checklistSubmissions = [] } = useQuery({
        queryKey: ['checklist-submissions'],
        queryFn: () => base44.entities.ChecklistSubmission.list('-created_date')
    });
    
    const { data: forms = [] } = useQuery({
        queryKey: ['forms'],
        queryFn: () => base44.entities.FormTemplate.filter({ status: 'active' })
    });
    
    const { data: checklists = [] } = useQuery({
        queryKey: ['checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.filter({ status: 'active' })
    });
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });
    
    const analytics = useMemo(() => {
        const now = new Date();
        const rangeStart = startOfDay(subDays(now, timeRange));
        
        const recentForms = formSubmissions.filter(s => new Date(s.created_date) >= rangeStart);
        const recentChecklists = checklistSubmissions.filter(s => new Date(s.created_date) >= rangeStart);
        
        // Daily submissions
        const dailyData = {};
        for (let i = 0; i < timeRange; i++) {
            const date = format(subDays(now, i), 'MMM dd');
            dailyData[date] = { date, forms: 0, checklists: 0 };
        }
        
        recentForms.forEach(s => {
            const date = format(new Date(s.created_date), 'MMM dd');
            if (dailyData[date]) dailyData[date].forms++;
        });
        
        recentChecklists.forEach(s => {
            const date = format(new Date(s.created_date), 'MMM dd');
            if (dailyData[date]) dailyData[date].checklists++;
        });
        
        // Status breakdown
        const statusData = {
            formsByStatus: {},
            checklistsByStatus: {}
        };
        
        recentForms.forEach(s => {
            statusData.formsByStatus[s.status] = (statusData.formsByStatus[s.status] || 0) + 1;
        });
        
        recentChecklists.forEach(s => {
            statusData.checklistsByStatus[s.status] = (statusData.checklistsByStatus[s.status] || 0) + 1;
        });
        
        // Top submitters
        const submitters = {};
        [...recentForms, ...recentChecklists].forEach(s => {
            if (s.submitted_by_name) {
                submitters[s.submitted_by_name] = (submitters[s.submitted_by_name] || 0) + 1;
            }
        });
        
        const topSubmitters = Object.entries(submitters)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
        
        // Average completion rate
        const totalChecklist = recentChecklists.length;
        const avgCompletion = totalChecklist > 0
            ? Math.round(recentChecklists.reduce((sum, c) => sum + (c.completion_percentage || 0), 0) / totalChecklist)
            : 0;
        
        return {
            totalForms: recentForms.length,
            totalChecklists: recentChecklists.length,
            avgCompletion,
            dailyData: Object.values(dailyData).reverse(),
            statusData,
            topSubmitters,
            uniqueUsers: Object.keys(submitters).length
        };
    }, [formSubmissions, checklistSubmissions, timeRange]);
    
    const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
    
    const exportData = () => {
        const data = {
            generatedAt: new Date().toISOString(),
            timeRange: `${timeRange} days`,
            summary: {
                totalFormSubmissions: analytics.totalForms,
                totalChecklistSubmissions: analytics.totalChecklists,
                averageCompletion: analytics.avgCompletion,
                uniqueUsers: analytics.uniqueUsers
            },
            formSubmissions,
            checklistSubmissions
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
    };
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">Reports & Analytics</h1>
                                <p className="text-sm text-blue-400">Track performance and trends</p>
                            </div>
                        </div>
                        <Button onClick={exportData} variant="outline" className="border-blue-800 text-blue-300 hover:bg-blue-950/50">
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Time Range Selector */}
                <div className="flex gap-2">
                    {[7, 14, 30, 90].map(days => (
                        <Button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            variant={timeRange === days ? 'default' : 'outline'}
                            size="sm"
                            className={timeRange === days 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'border-blue-800 text-blue-300 hover:bg-blue-950/50'}
                        >
                            {days} days
                        </Button>
                    ))}
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Form Submissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-white">{analytics.totalForms}</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                                <CheckSquare className="w-4 h-4" />
                                Checklist Completions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-white">{analytics.totalChecklists}</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Avg Completion
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-white">{analytics.avgCompletion}%</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Active Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-white">{analytics.uniqueUsers}</p>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Activity */}
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white">Daily Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={analytics.dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                                    <XAxis dataKey="date" stroke="#60a5fa" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#60a5fa" style={{ fontSize: '12px' }} />
                                    <Tooltip 
                                        contentStyle={{ background: '#0f1419', border: '1px solid #1e3a8a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#60a5fa' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#60a5fa' }} />
                                    <Line type="monotone" dataKey="forms" stroke="#3b82f6" strokeWidth={2} name="Forms" />
                                    <Line type="monotone" dataKey="checklists" stroke="#60a5fa" strokeWidth={2} name="Checklists" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    
                    {/* Form Status Breakdown */}
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white">Form Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={Object.entries(analytics.statusData.formsByStatus).map(([name, value]) => ({ name, value }))}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {Object.keys(analytics.statusData.formsByStatus).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ background: '#0f1419', border: '1px solid #1e3a8a', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Top Submitters */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white">Top Submitters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics.topSubmitters}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                                <XAxis dataKey="name" stroke="#60a5fa" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#60a5fa" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ background: '#0f1419', border: '1px solid #1e3a8a', borderRadius: '8px' }}
                                    labelStyle={{ color: '#60a5fa' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}