import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckSquare, ListTodo, FolderOpen, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MetricsOverview({ forms, checklists, tasks, documents, automations }) {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = tasks.length > 0 ? (completedTasks / tasks.length * 100).toFixed(1) : 0;
    
    const completedChecklists = checklists.filter(c => c.status === 'completed').length;
    const checklistCompletionRate = checklists.length > 0 ? (completedChecklists / checklists.length * 100).toFixed(1) : 0;
    
    const activeAutomations = automations.filter(a => a.enabled).length;
    const totalExecutions = automations.reduce((sum, a) => sum + (a.execution_count || 0), 0);

    const metrics = [
        {
            title: 'Form Submissions',
            value: forms.length,
            icon: FileText,
            color: 'from-blue-500 to-blue-600',
            trend: '+12%',
            trendUp: true
        },
        {
            title: 'Checklist Completion',
            value: `${checklistCompletionRate}%`,
            subtitle: `${completedChecklists}/${checklists.length}`,
            icon: CheckSquare,
            color: 'from-green-500 to-green-600',
            trend: '+8%',
            trendUp: true
        },
        {
            title: 'Task Efficiency',
            value: `${taskCompletionRate}%`,
            subtitle: `${completedTasks}/${tasks.length}`,
            icon: ListTodo,
            color: 'from-purple-500 to-purple-600',
            trend: '-3%',
            trendUp: false
        },
        {
            title: 'Documents',
            value: documents.length,
            icon: FolderOpen,
            color: 'from-orange-500 to-orange-600',
            trend: '+15%',
            trendUp: true
        },
        {
            title: 'Active Automations',
            value: activeAutomations,
            subtitle: `${totalExecutions} executions`,
            icon: Zap,
            color: 'from-yellow-500 to-yellow-600',
            trend: '+5%',
            trendUp: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                    <motion.div
                        key={metric.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="bg-[#0f1419] border-blue-900/20 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        {metric.trendUp ? (
                                            <TrendingUp className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 text-red-500" />
                                        )}
                                        <span className={metric.trendUp ? 'text-green-500' : 'text-red-500'}>
                                            {metric.trend}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                                <p className="text-sm text-blue-400">{metric.title}</p>
                                {metric.subtitle && (
                                    <p className="text-xs text-blue-500 mt-1">{metric.subtitle}</p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}