import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Download, Calendar, Filter, TrendingUp, FileDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PDFReportGenerator from '@/components/reports/PDFReportGenerator';
import CustomDashboardBuilder, { useDashboardConfig } from '@/components/reports/CustomDashboardBuilder';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import RoleGuard from '@/components/auth/RoleGuard';
import MetricsOverview from '@/components/analytics/MetricsOverview';
import CompletionRateChart from '@/components/analytics/CompletionRateChart';
import TaskEfficiencyChart from '@/components/analytics/TaskEfficiencyChart';
import AutomationAnalytics from '@/components/analytics/AutomationAnalytics';
import DocumentUsageChart from '@/components/analytics/DocumentUsageChart';
import { format, subDays } from 'date-fns';

function AnalyticsDashboardContent() {
    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date()
    });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedUser, setSelectedUser] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const { config: dashboardConfig, setConfig: setDashboardConfig } = useDashboardConfig();

    const { data: formSubmissions = [] } = useQuery({
        queryKey: ['analytics-forms', dateRange],
        queryFn: () => base44.entities.FormSubmission.list('-created_date')
    });

    const { data: checklistSubmissions = [] } = useQuery({
        queryKey: ['analytics-checklists', dateRange],
        queryFn: () => base44.entities.ChecklistSubmission.list('-created_date')
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['analytics-tasks', dateRange],
        queryFn: () => base44.entities.Task.list('-created_date')
    });

    const { data: documents = [] } = useQuery({
        queryKey: ['analytics-documents', dateRange],
        queryFn: () => base44.entities.Document.list('-created_date')
    });

    const { data: automations = [] } = useQuery({
        queryKey: ['analytics-automations'],
        queryFn: () => base44.entities.AutomationRule.list()
    });

    const { data: activityLogs = [] } = useQuery({
        queryKey: ['analytics-activity', dateRange],
        queryFn: () => base44.entities.ActivityLog.list('-created_date', 1000)
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });

    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list()
    });

    // Filter data by date range, category, and user
    const filterData = (items) => {
        let filtered = items;

        // Date filter
        if (dateRange.from && dateRange.to) {
            filtered = filtered.filter(item => {
                const date = new Date(item.created_date);
                return date >= dateRange.from && date <= dateRange.to;
            });
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category_id === selectedCategory);
        }

        // User filter
        if (selectedUser !== 'all') {
            filtered = filtered.filter(item => 
                item.created_by === selectedUser || 
                item.assigned_to_email === selectedUser ||
                item.submitted_by_name === selectedUser
            );
        }

        return filtered;
    };

    const filteredForms = filterData(formSubmissions);
    const filteredChecklists = filterData(checklistSubmissions);
    const filteredTasks = filterData(tasks);
    const filteredDocuments = filterData(documents);
    const filteredActivity = filterData(activityLogs);

    const handleExportCSV = () => {
        const csvData = [
            ['Metric', 'Value'],
            ['Report Date', format(new Date(), 'MMM d, yyyy HH:mm')],
            ['Date Range', `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`],
            ['Category Filter', selectedCategory === 'all' ? 'All' : categories.find(c => c.id === selectedCategory)?.name || 'N/A'],
            ['User Filter', selectedUser === 'all' ? 'All' : selectedUser],
            [''],
            ['SUBMISSIONS'],
            ['Total Form Submissions', filteredForms.length],
            ['Total Checklist Submissions', filteredChecklists.length],
            ['Completed Checklists', filteredChecklists.filter(c => c.status === 'completed').length],
            [''],
            ['TASKS'],
            ['Total Tasks', filteredTasks.length],
            ['Completed Tasks', filteredTasks.filter(t => t.status === 'completed').length],
            ['In Progress Tasks', filteredTasks.filter(t => t.status === 'in_progress').length],
            ['Overdue Tasks', filteredTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length],
            [''],
            ['DOCUMENTS'],
            ['Total Documents', filteredDocuments.length],
            ['Total Storage (MB)', (filteredDocuments.reduce((sum, d) => sum + (d.file_size || 0), 0) / 1024 / 1024).toFixed(2)],
            [''],
            ['AUTOMATIONS'],
            ['Active Automations', automations.filter(a => a.enabled).length],
            ['Total Executions', automations.reduce((sum, a) => sum + (a.execution_count || 0), 0)]
        ];

        const csv = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-[#FF8C00]" />
                                    Analytics Dashboard
                                </h1>
                                <p className="text-sm text-blue-300">
                                    Insights and performance metrics
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CustomDashboardBuilder onConfigChange={setDashboardConfig} />
                            <div className="flex gap-2">
                            <Button 
                                onClick={() => setShowFilters(!showFilters)} 
                                variant="outline" 
                                className="gap-2 border-blue-600 text-blue-300"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </Button>
                            <PDFReportGenerator
                                dateRange={dateRange}
                                forms={filteredForms}
                                checklists={filteredChecklists}
                                tasks={filteredTasks}
                                documents={filteredDocuments}
                                automations={automations}
                                selectedCategory={selectedCategory}
                                selectedUser={selectedUser}
                                categories={categories}
                            />
                            <Button onClick={handleExportCSV} variant="outline" className="gap-2 border-blue-600 text-blue-300">
                                <Download className="w-4 h-4" />
                                CSV
                            </Button>
                        </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={`space-y-3 transition-all ${showFilters ? 'block' : 'hidden'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-blue-400" />
                                <DatePickerWithRange
                                    date={dateRange}
                                    onDateChange={setDateRange}
                                />
                            </div>
                            
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="bg-[#0f1419] border-blue-900/20 text-white">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger className="bg-[#0f1419] border-blue-900/20 text-white">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.email}>{user.full_name || user.email}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {/* Key Metrics Overview */}
            {dashboardConfig.includes('metrics') && (
                <MetricsOverview
                    forms={filteredForms}
                    checklists={filteredChecklists}
                    tasks={filteredTasks}
                    documents={filteredDocuments}
                    automations={automations}
                />
            )}

                {/* Charts Tabs */}
                {(dashboardConfig.includes('completion') || dashboardConfig.includes('tasks') || 
                  dashboardConfig.includes('automation') || dashboardConfig.includes('documents')) && (
                    <Tabs defaultValue={dashboardConfig.includes('completion') ? 'completion' : dashboardConfig[0]} className="w-full">
                        <TabsList className={`grid w-full bg-[#0f1419]`} style={{ gridTemplateColumns: `repeat(${dashboardConfig.filter(id => id !== 'metrics').length}, 1fr)` }}>
                            {dashboardConfig.includes('completion') && <TabsTrigger value="completion">Completion Rates</TabsTrigger>}
                            {dashboardConfig.includes('tasks') && <TabsTrigger value="tasks">Task Efficiency</TabsTrigger>}
                            {dashboardConfig.includes('automation') && <TabsTrigger value="automation">Automation</TabsTrigger>}
                            {dashboardConfig.includes('documents') && <TabsTrigger value="documents">Documents</TabsTrigger>}
                        </TabsList>

                        {dashboardConfig.includes('completion') && (
                            <TabsContent value="completion" className="space-y-4">
                                <CompletionRateChart
                                    forms={filteredForms}
                                    checklists={filteredChecklists}
                                    dateRange={dateRange}
                                />
                            </TabsContent>
                        )}

                        {dashboardConfig.includes('tasks') && (
                            <TabsContent value="tasks" className="space-y-4">
                                <TaskEfficiencyChart
                                    tasks={filteredTasks}
                                    dateRange={dateRange}
                                />
                            </TabsContent>
                        )}

                        {dashboardConfig.includes('automation') && (
                            <TabsContent value="automation" className="space-y-4">
                                <AutomationAnalytics
                                    automations={automations}
                                    activityLogs={filteredActivity}
                                />
                            </TabsContent>
                        )}

                        {dashboardConfig.includes('documents') && (
                            <TabsContent value="documents" className="space-y-4">
                                <DocumentUsageChart
                                    documents={filteredDocuments}
                                    dateRange={dateRange}
                                />
                            </TabsContent>
                        )}
                    </Tabs>
                )}
            </div>
        </div>
    );
}

export default function AnalyticsDashboard() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']} requiredPermission="can_view_reports">
            <AnalyticsDashboardContent />
        </RoleGuard>
    );
}