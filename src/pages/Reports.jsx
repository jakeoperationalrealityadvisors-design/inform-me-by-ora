import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, CheckSquare, ListTodo, TrendingUp, BarChart3, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoleGuard from '@/components/auth/RoleGuard';
import MetricCard from '@/components/reports/MetricCard';
import SubmissionChart from '@/components/reports/SubmissionChart';
import ReportFilters from '@/components/reports/ReportFilters';
import BottomNav from '@/components/navigation/BottomNav';
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { toast } from 'sonner';

function ReportsContent() {
    const [dateRange, setDateRange] = useState({
        from: startOfMonth(subMonths(new Date(), 2)),
        to: endOfMonth(new Date())
    });
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('all');

    // Fetch data
    const { data: forms = [] } = useQuery({
        queryKey: ['form-submissions'],
        queryFn: () => base44.entities.FormSubmission.list('-created_date')
    });

    const { data: checklists = [] } = useQuery({
        queryKey: ['checklist-submissions'],
        queryFn: () => base44.entities.ChecklistSubmission.list('-created_date')
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });

    const { data: formTemplates = [] } = useQuery({
        queryKey: ['form-templates'],
        queryFn: () => base44.entities.FormTemplate.list()
    });

    const { data: checklistTemplates = [] } = useQuery({
        queryKey: ['checklist-templates'],
        queryFn: () => base44.entities.ChecklistTemplate.list()
    });

    // Filter data
    const filteredData = useMemo(() => {
        const filterSubmissions = (submissions) => {
            return submissions.filter(sub => {
                // Date filter
                if (dateRange.from && dateRange.to) {
                    const subDate = parseISO(sub.created_date);
                    if (!isWithinInterval(subDate, { start: dateRange.from, end: dateRange.to })) {
                        return false;
                    }
                }

                // Category filter
                if (category !== 'all') {
                    const template = sub.form_template_id 
                        ? formTemplates.find(f => f.id === sub.form_template_id)
                        : checklistTemplates.find(c => c.id === sub.checklist_template_id);
                    if (template?.category_id !== category) return false;
                }

                // Status filter
                if (status !== 'all' && sub.status !== status) return false;

                return true;
            });
        };

        return {
            forms: filterSubmissions(forms),
            checklists: filterSubmissions(checklists)
        };
    }, [forms, checklists, dateRange, category, status, formTemplates, checklistTemplates]);

    // Calculate metrics
    const metrics = useMemo(() => {
        const totalSubmissions = filteredData.forms.length + filteredData.checklists.length;
        const completedForms = filteredData.forms.filter(f => f.status === 'completed' || f.status === 'reviewed').length;
        const completedChecklists = filteredData.checklists.filter(c => c.status === 'completed').length;
        const avgChecklistCompletion = filteredData.checklists.length > 0
            ? Math.round(filteredData.checklists.reduce((sum, c) => sum + (c.completion_percentage || 0), 0) / filteredData.checklists.length)
            : 0;

        return {
            totalSubmissions,
            totalForms: filteredData.forms.length,
            totalChecklists: filteredData.checklists.length,
            completedForms,
            completedChecklists,
            avgChecklistCompletion
        };
    }, [filteredData]);

    // Chart data - Submissions over time
    const submissionsOverTime = useMemo(() => {
        const dataMap = {};
        
        [...filteredData.forms, ...filteredData.checklists].forEach(sub => {
            const date = format(parseISO(sub.created_date), 'MMM dd');
            dataMap[date] = (dataMap[date] || 0) + 1;
        });

        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    }, [filteredData]);

    // Chart data - Status distribution
    const statusDistribution = useMemo(() => {
        const statuses = {};
        
        [...filteredData.forms, ...filteredData.checklists].forEach(sub => {
            const statusName = sub.status || 'submitted';
            statuses[statusName] = (statuses[statusName] || 0) + 1;
        });

        return Object.entries(statuses).map(([name, value]) => ({ 
            name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
            value 
        }));
    }, [filteredData]);

    // Chart data - Category breakdown
    const categoryBreakdown = useMemo(() => {
        const catMap = {};
        
        [...filteredData.forms, ...filteredData.checklists].forEach(sub => {
            const template = sub.form_template_id 
                ? formTemplates.find(f => f.id === sub.form_template_id)
                : checklistTemplates.find(c => c.id === sub.checklist_template_id);
            
            if (template?.category_id) {
                const cat = categories.find(c => c.id === template.category_id);
                const catName = cat?.name || 'Uncategorized';
                catMap[catName] = (catMap[catName] || 0) + 1;
            }
        });

        return Object.entries(catMap).map(([name, value]) => ({ name, value }));
    }, [filteredData, categories, formTemplates, checklistTemplates]);

    // Export function
    const handleExport = () => {
        const csvData = [
            ['Type', 'Title', 'Status', 'Submitted By', 'Date', 'Location'],
            ...filteredData.forms.map(f => [
                'Form',
                f.form_title,
                f.status,
                f.submitted_by_name,
                format(parseISO(f.created_date), 'yyyy-MM-dd'),
                f.location || ''
            ]),
            ...filteredData.checklists.map(c => [
                'Checklist',
                c.checklist_title,
                c.status,
                c.submitted_by_name,
                format(parseISO(c.created_date), 'yyyy-MM-dd'),
                c.location || ''
            ])
        ];

        const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        toast.success('Report exported successfully');
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#0a0e17] transition-colors pb-20 md:pb-6">
            {/* Header */}
            <div className="bg-white dark:bg-[#0f1419] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm transition-colors">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-6 h-6 text-orange-500" />
                                Reports & Analytics
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Insights and metrics from your data
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <ReportFilters
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                            category={category}
                            setCategory={setCategory}
                            status={status}
                            setStatus={setStatus}
                            categories={categories}
                            onExport={handleExport}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <MetricCard
                                title="Total Submissions"
                                value={metrics.totalSubmissions}
                                icon={TrendingUp}
                                color="orange"
                            />
                            <MetricCard
                                title="Forms Submitted"
                                value={metrics.totalForms}
                                icon={FileText}
                                color="blue"
                            />
                            <MetricCard
                                title="Checklists Completed"
                                value={metrics.totalChecklists}
                                icon={CheckSquare}
                                color="green"
                            />
                            <MetricCard
                                title="Avg. Completion"
                                value={`${metrics.avgChecklistCompletion}%`}
                                icon={BarChart3}
                                color="purple"
                            />
                            <MetricCard
                                title="Forms Completed"
                                value={metrics.completedForms}
                                icon={FileText}
                                color="green"
                            />
                            <MetricCard
                                title="Active Categories"
                                value={categoryBreakdown.length}
                                icon={Users}
                                color="blue"
                            />
                        </div>

                        {/* Charts */}
                        <Tabs defaultValue="timeline" className="space-y-4">
                            <TabsList className="bg-white dark:bg-[#0f1419] border border-slate-200 dark:border-slate-800">
                                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                <TabsTrigger value="status">Status</TabsTrigger>
                                <TabsTrigger value="categories">Categories</TabsTrigger>
                            </TabsList>

                            <TabsContent value="timeline">
                                <SubmissionChart
                                    data={submissionsOverTime}
                                    type="line"
                                    title="Submissions Over Time"
                                    dataKey="value"
                                    xKey="name"
                                />
                            </TabsContent>

                            <TabsContent value="status">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <SubmissionChart
                                        data={statusDistribution}
                                        type="pie"
                                        title="Status Distribution"
                                        dataKey="value"
                                    />
                                    <SubmissionChart
                                        data={statusDistribution}
                                        type="bar"
                                        title="Status Breakdown"
                                        dataKey="value"
                                        xKey="name"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="categories">
                                <SubmissionChart
                                    data={categoryBreakdown}
                                    type="bar"
                                    title="Submissions by Category"
                                    dataKey="value"
                                    xKey="name"
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

export default function Reports() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']}>
            <ReportsContent />
        </RoleGuard>
    );
}