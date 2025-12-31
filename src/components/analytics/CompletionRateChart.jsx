import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';

export default function CompletionRateChart({ forms, checklists, dateRange }) {
    // Daily completion data
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const dailyData = days.map(day => {
        const dayStart = startOfDay(day);
        const dayForms = forms.filter(f => {
            const created = startOfDay(new Date(f.created_date));
            return created.getTime() === dayStart.getTime();
        });
        const dayChecklists = checklists.filter(c => {
            const created = startOfDay(new Date(c.created_date));
            return created.getTime() === dayStart.getTime();
        });

        return {
            date: format(day, 'MMM d'),
            forms: dayForms.length,
            checklists: dayChecklists.length
        };
    });

    // Status distribution
    const formStatuses = [
        { name: 'Submitted', value: forms.filter(f => f.status === 'submitted').length },
        { name: 'Reviewed', value: forms.filter(f => f.status === 'reviewed').length },
        { name: 'Approved', value: forms.filter(f => f.status === 'approved').length },
        { name: 'Rejected', value: forms.filter(f => f.status === 'rejected').length }
    ].filter(s => s.value > 0);

    const checklistStatuses = [
        { name: 'In Progress', value: checklists.filter(c => c.status === 'in_progress').length },
        { name: 'Completed', value: checklists.filter(c => c.status === 'completed').length },
        { name: 'Reviewed', value: checklists.filter(c => c.status === 'reviewed').length }
    ].filter(s => s.value > 0);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Over Time */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Submissions Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.1} />
                            <XAxis dataKey="date" stroke="#60a5fa" />
                            <YAxis stroke="#60a5fa" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="forms" stroke="#3b82f6" strokeWidth={2} name="Forms" />
                            <Line type="monotone" dataKey="checklists" stroke="#10b981" strokeWidth={2} name="Checklists" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Form Status Distribution */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Form Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={formStatuses}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {formStatuses.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Checklist Completion Rate */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Checklist Completion Rates</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={checklistStatuses}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#60a5fa" />
                            <YAxis stroke="#60a5fa" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Bar dataKey="value" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Average Completion Percentage */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Completion Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-blue-300">Average Checklist Completion</span>
                                <span className="text-white font-semibold">
                                    {checklists.length > 0
                                        ? (checklists.reduce((sum, c) => sum + (c.completion_percentage || 0), 0) / checklists.length).toFixed(1)
                                        : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                    style={{
                                        width: `${checklists.length > 0
                                            ? checklists.reduce((sum, c) => sum + (c.completion_percentage || 0), 0) / checklists.length
                                            : 0}%`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-950/30 rounded-lg p-4">
                                <p className="text-xs text-blue-400 mb-1">Total Forms</p>
                                <p className="text-2xl font-bold text-white">{forms.length}</p>
                            </div>
                            <div className="bg-green-950/30 rounded-lg p-4">
                                <p className="text-xs text-green-400 mb-1">Total Checklists</p>
                                <p className="text-2xl font-bold text-white">{checklists.length}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}