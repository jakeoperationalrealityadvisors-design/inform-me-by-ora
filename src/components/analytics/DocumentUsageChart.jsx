import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { FolderOpen, Upload } from 'lucide-react';

export default function DocumentUsageChart({ documents, dateRange }) {
    // Daily uploads
    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const dailyUploads = days.map(day => {
        const dayStart = startOfDay(day);
        const uploads = documents.filter(d => {
            const created = startOfDay(new Date(d.created_date));
            return created.getTime() === dayStart.getTime();
        });

        return {
            date: format(day, 'MMM d'),
            uploads: uploads.length
        };
    });

    // File type distribution
    const fileTypes = documents.reduce((acc, doc) => {
        const type = doc.file_type?.split('/')[0] || 'other';
        const existing = acc.find(t => t.name === type);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: type, value: 1 });
        }
        return acc;
    }, []);

    // Storage usage
    const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
    const avgSize = documents.length > 0 ? totalSize / documents.length : 0;

    // Documents by folder
    const byFolder = documents.reduce((acc, doc) => {
        const folder = doc.folder_id || 'Uncategorized';
        acc[folder] = (acc[folder] || 0) + 1;
        return acc;
    }, {});

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Trend */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Document Uploads Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailyUploads}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e40af" opacity={0.1} />
                            <XAxis dataKey="date" stroke="#60a5fa" />
                            <YAxis stroke="#60a5fa" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="uploads"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* File Type Distribution */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">File Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={fileTypes}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {fileTypes.map((entry, index) => (
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

            {/* Storage Stats */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Storage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-950/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FolderOpen className="w-4 h-4 text-blue-400" />
                                    <p className="text-xs text-blue-400">Total Docs</p>
                                </div>
                                <p className="text-2xl font-bold text-white">{documents.length}</p>
                            </div>
                            <div className="bg-purple-950/30 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Upload className="w-4 h-4 text-purple-400" />
                                    <p className="text-xs text-purple-400">Total Size</p>
                                </div>
                                <p className="text-2xl font-bold text-white">{formatBytes(totalSize)}</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-950/30 to-orange-900/20 rounded-lg p-4">
                            <p className="text-xs text-orange-400 mb-2">Average File Size</p>
                            <p className="text-2xl font-bold text-white">{formatBytes(avgSize)}</p>
                        </div>

                        <div>
                            <p className="text-sm text-blue-300 mb-3">Recent Activity</p>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-200">Last 7 days</span>
                                    <span className="text-white font-semibold">
                                        {documents.filter(d => {
                                            const diff = new Date() - new Date(d.created_date);
                                            return diff < 7 * 24 * 60 * 60 * 1000;
                                        }).length} uploads
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-200">Versions</span>
                                    <span className="text-white font-semibold">
                                        {documents.reduce((sum, d) => sum + (d.version || 1), 0)} total
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Most Active Users */}
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white">Top Contributors</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.entries(
                            documents.reduce((acc, doc) => {
                                const uploader = doc.uploaded_by_name || doc.created_by || 'Unknown';
                                acc[uploader] = (acc[uploader] || 0) + 1;
                                return acc;
                            }, {})
                        )
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([name, count]) => (
                                <div key={name} className="flex items-center justify-between">
                                    <span className="text-blue-200 text-sm">{name}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 bg-slate-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                                style={{ width: `${(count / documents.length) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-white font-semibold text-sm w-8">{count}</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}