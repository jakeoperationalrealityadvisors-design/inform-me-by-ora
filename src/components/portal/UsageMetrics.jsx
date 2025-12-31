import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, CheckSquare, HardDrive, Zap } from 'lucide-react';

export default function UsageMetrics({ organization, members, formSubmissions, checklistSubmissions, documents, automations }) {
    const userUsage = (members.length / organization.max_users) * 100;
    const storageUsed = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);
    const storageLimit = 5 * 1024 * 1024 * 1024; // 5GB
    const storageUsage = (storageUsed / storageLimit) * 100;
    
    const metrics = [
        {
            label: 'Team Members',
            icon: Users,
            current: members.length,
            limit: organization.max_users,
            usage: userUsage,
            color: 'text-blue-500'
        },
        {
            label: 'Form Submissions',
            icon: FileText,
            current: formSubmissions.length,
            limit: 'Unlimited',
            usage: null,
            color: 'text-green-500'
        },
        {
            label: 'Checklist Submissions',
            icon: CheckSquare,
            current: checklistSubmissions.length,
            limit: 'Unlimited',
            usage: null,
            color: 'text-purple-500'
        },
        {
            label: 'Storage',
            icon: HardDrive,
            current: `${(storageUsed / 1024 / 1024).toFixed(1)} MB`,
            limit: '5 GB',
            usage: storageUsage,
            color: 'text-orange-500'
        },
        {
            label: 'Active Automations',
            icon: Zap,
            current: automations.filter(a => a.enabled).length,
            limit: 'Unlimited',
            usage: null,
            color: 'text-[#FF8C00]'
        }
    ];
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric, idx) => (
                <Card key={idx} className="bg-[#0f1419] border-blue-900/20">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <metric.icon className={`w-5 h-5 ${metric.color}`} />
                            {metric.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-white">{metric.current}</span>
                                <span className="text-sm text-blue-400">of {metric.limit}</span>
                            </div>
                            
                            {metric.usage !== null && (
                                <>
                                    <Progress value={metric.usage} className="h-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-blue-400">{metric.usage.toFixed(1)}% used</span>
                                        {metric.usage > 80 && (
                                            <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-600">
                                                Approaching limit
                                            </Badge>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}