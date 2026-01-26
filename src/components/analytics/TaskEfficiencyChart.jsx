import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { differenceInDays, format, eachDayOfInterval, startOfDay } from 'date-fns';

export default function TaskEfficiencyChart({ tasks, dateRange }) {
    // Task status distribution
    const statusData = [
        { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#64748b' },
        { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
        { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
        { name: 'Cancelled', value: tasks.filter(t => t.status === 'cancelled').length, color: '#ef4444' }
    ].filter(s => s.value > 0);

    // Priority distribution
    const priorityData = [
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
        { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length }
    ];

    // Average completion time
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.completed_date);
    const avgCompletionDays = completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => {
            const created = new Date(t.created_date);
            const completed = new Date(t.completed_date);
            return sum + differenceInDays(completed, created);
        }, 0) / completedTasks.length
        : 0;

    // Daily task completion trend
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const dailyCompletion = days.map(day => {
        const dayStart = startOfDay(day);
        const completed = completedTasks.filter(t => {
            const compDate = startOfDay(new Date(t.completed_date));
            return compDate.getTime() === dayStart.getTime();
        });

        return {
            date: format(day, 'MMM d'),
            completed: completed.length
        };
    });

    // Overdue tasks
    const overdueTasks = tasks.filter(t => 
        t.due_date && 
        new Date(t.due_date) < new Date() && 
        t.status !== 'completed'
    ).length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Task Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Task Priority Levels</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={priorityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#60a5fa" />
                            <YAxis stroke="#60a5fa" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Bar dataKey="value" fill="#f59e0b" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Completion Trend */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Daily Task Completion</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyCompletion}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.1} />
                            <XAxis dataKey="date" stroke="#60a5fa" />
                            <YAxis stroke="#60a5fa" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-950/30 rounded-lg p-4">
                                <p className="text-xs text-green-400 mb-1">Completed</p>
                                <p className="text-2xl font-bold text-white">{completedTasks.length}</p>
                            </div>
                            <div className="bg-red-950/30 rounded-lg p-4">
                                <p className="text-xs text-red-400 mb-1">Overdue</p>
                                <p className="text-2xl font-bold text-white">{overdueTasks}</p>
                            </div>
                        </div>

                        <div className="bg-blue-950/30 rounded-lg p-4">
                            <p className="text-xs text-blue-400 mb-2">Avg. Completion Time</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-white">{avgCompletionDays.toFixed(1)}</p>
                                <p className="text-sm text-blue-300">days</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-blue-300">Completion Rate</span>
                                <span className="text-white font-semibold">
                                    {tasks.length > 0 ? ((completedTasks.length / tasks.length) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                    style={{
                                        width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}