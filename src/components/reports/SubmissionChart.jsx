import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SubmissionChart({ data, type = 'line', title, dataKey = 'value', xKey = 'name' }) {
    const COLORS = ['#FF8C00', '#1E90FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                            <XAxis dataKey={xKey} stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#0f1419', 
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey={dataKey} fill="#FF8C00" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey={dataKey}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#0f1419', 
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                );
            default:
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                            <XAxis dataKey={xKey} stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#0f1419', 
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey={dataKey} 
                                stroke="#FF8C00" 
                                strokeWidth={2}
                                dot={{ fill: '#FF8C00', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <Card className="bg-white dark:bg-[#0f1419] border-slate-200 dark:border-slate-800 transition-colors">
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {renderChart()}
            </CardContent>
        </Card>
    );
}