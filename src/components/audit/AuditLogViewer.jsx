import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { 
    FileText, CheckSquare, User, Settings, Folder, 
    Zap, Trash2, Edit, Plus, Eye 
} from 'lucide-react';

const ACTION_ICONS = {
    created: Plus,
    edited: Edit,
    updated: Edit,
    deleted: Trash2,
    submitted: FileText,
    completed: CheckSquare,
    invited: User,
    default: Eye
};

const ACTION_COLORS = {
    created: 'bg-green-500/10 text-green-400 border-green-500/20',
    edited: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    updated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    deleted: 'bg-red-500/10 text-red-400 border-red-500/20',
    submitted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    invited: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    default: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

export default function AuditLogViewer({ log }) {
    const actionKey = log.action_type.split('_').pop();
    const Icon = ACTION_ICONS[actionKey] || ACTION_ICONS.default;
    const colorClass = ACTION_COLORS[actionKey] || ACTION_COLORS.default;

    return (
        <Card className="bg-[#0f1419] border-blue-900/20 hover:border-blue-700/30 transition-all">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${colorClass} border flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                                <p className="text-white font-medium">{log.description}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs text-blue-400">
                                        {log.user_name || log.user_email}
                                    </span>
                                    <span className="text-xs text-blue-600">•</span>
                                    <span className="text-xs text-blue-500">
                                        {format(new Date(log.created_date), 'MMM d, yyyy HH:mm:ss')}
                                    </span>
                                </div>
                            </div>
                            <Badge className={colorClass}>
                                {log.action_type.replace(/_/g, ' ')}
                            </Badge>
                        </div>

                        {log.entity_title && (
                            <div className="text-xs text-blue-300 mb-1">
                                <span className="text-blue-500">Target:</span> {log.entity_type} - {log.entity_title}
                            </div>
                        )}

                        {log.metadata && (
                            <details className="mt-2">
                                <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                                    View Details
                                </summary>
                                <div className="mt-2 p-3 bg-[#0a0e17] rounded-lg border border-blue-900/30">
                                    <pre className="text-xs text-blue-300 whitespace-pre-wrap overflow-auto max-h-40">
                                        {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                </div>
                            </details>
                        )}

                        {log.ip_address && (
                            <div className="text-xs text-blue-600 mt-2">
                                IP: {log.ip_address}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}