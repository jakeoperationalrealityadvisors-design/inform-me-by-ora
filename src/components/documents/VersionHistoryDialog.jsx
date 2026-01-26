import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function VersionHistoryDialog({ open, onOpenChange, document }) {
    const { data: versions = [], isLoading } = useQuery({
        queryKey: ['document-versions', document?.id],
        queryFn: () => httpClient.entities.DocumentVersion.filter({ document_id: document.id }, '-version_number'),
        enabled: open && !!document
    });

    const handleDownload = (fileUrl) => {
        window.open(fileUrl, '_blank');
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Version History - {document?.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="text-center py-12 text-slate-500">Loading versions...</div>
                    ) : (
                        <>
                            {/* Current Version */}
                            <div className="border-l-4 border-green-600 pl-4 py-4 bg-green-50/50 rounded-r">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-slate-900 text-lg">
                                                Version {document?.version || 1}
                                            </span>
                                            <Badge className="bg-green-600 text-white">Current</Badge>
                                        </div>
                                        <p className="text-sm text-slate-700 font-medium mb-2">{document?.file_name}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" />
                                                {document?.uploaded_by_name || document?.created_by}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {format(new Date(document?.updated_date), 'MMM d, yyyy h:mm a')}
                                            </span>
                                            <span className="text-slate-500">
                                                {formatFileSize(document?.file_size)}
                                            </span>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleDownload(document?.file_url)}
                                        className="border-green-600 text-green-700 hover:bg-green-50"
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            </div>

                            {/* Previous Versions */}
                            {versions.length > 0 ? (
                                versions.map((version) => (
                                    <div 
                                        key={version.id}
                                        className="border-l-4 border-slate-300 pl-4 py-4 hover:bg-slate-50 rounded-r transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium text-slate-900">
                                                        Version {version.version_number}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 mb-1">{version.file_name}</p>
                                                {version.change_notes && (
                                                    <p className="text-sm text-slate-600 italic mb-2 bg-slate-100 rounded px-2 py-1">
                                                        "{version.change_notes}"
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        {version.uploaded_by_name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {format(new Date(version.created_date), 'MMM d, yyyy h:mm a')}
                                                    </span>
                                                    <span className="text-slate-400">
                                                        {formatFileSize(version.file_size)}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleDownload(version.file_url)}
                                                className="text-slate-600 hover:text-slate-900"
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    No previous versions
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}