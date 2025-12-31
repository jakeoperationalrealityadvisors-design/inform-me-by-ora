import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Download, Calendar, Filter, TrendingUp } from 'lucide-react';
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

    // Filter data by date range
    const filterByDate = (items) => {
        if (!dateRange.from || !dateRange.to) return items;
        return items.filter(item => {
            const date = new Date(item.created_date);
            return date >= dateRange.from && date <= dateRange.to;
        });
    };

    const filteredForms = filterByDate(formSubmissions);
    const filteredChecklists = filterByDate(checklistSubmissions);
    const filteredTasks = filterByDate(tasks);
    const filteredDocuments = filterByDate(documents);
    const filteredActivity = filterByDate(activityLogs);

    const handleExportCSV = () => {
        const csvData = [
            ['Metric', 'Value'],
            ['Total Form Submissions', filteredForms.length],
            ['Total Checklist Submissions', filteredChecklists.length],
            ['Total Tasks', filteredTasks.length],
            ['Completed Tasks', filteredTasks.filter(t => t.status === 'completed').length],
            ['Total Documents', filteredDocuments.length],
            ['Active Automations', automations.filter(a => a.enabled).length],
            ['Date Range', `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`]
        ];

        const csv = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
                        <Button onClick={handleExportCSV} variant="outline" className="gap-2 border-blue-600 text-blue-300">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Date Range Picker */}
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <DatePickerWithRange
                            date={dateRange}
                            onDateChange={setDateRange}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Key Metrics Overview */}
                <MetricsOverview
                    forms={filteredForms}
                    checklists={filteredChecklists}
                    tasks={filteredTasks}
                    documents={filteredDocuments}
                    automations={automations}
                />

                {/* Charts Tabs */}
                <Tabs defaultValue="completion" className="w-full">
                    <TabsList className="grid grid-cols-4 w-full bg-[#0f1419]">
                        <TabsTrigger value="completion">Completion Rates</TabsTrigger>
                        <TabsTrigger value="tasks">Task Efficiency</TabsTrigger>
                        <TabsTrigger value="automation">Automation</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="completion" className="space-y-4">
                        <CompletionRateChart
                            forms={filteredForms}
                            checklists={filteredChecklists}
                            dateRange={dateRange}
                        />
                    </TabsContent>

                    <TabsContent value="tasks" className="space-y-4">
                        <TaskEfficiencyChart
                            tasks={filteredTasks}
                            dateRange={dateRange}
                        />
                    </TabsContent>

                    <TabsContent value="automation" className="space-y-4">
                        <AutomationAnalytics
                            automations={automations}
                            activityLogs={filteredActivity}
                        />
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4">
                        <DocumentUsageChart
                            documents={filteredDocuments}
                            dateRange={dateRange}
                        />
                    </TabsContent>
                </Tabs>
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