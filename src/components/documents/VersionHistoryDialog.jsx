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
                        <div className="text-center py-12 text-blue-400/70">Loading versions...</div>
                    ) : (
                        <>
                            {/* Current Version */}
                            <div className="border-l-4 border-green-600 pl-4 py-4 bg-green-50/50 rounded-r">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-semibold text-white text-lg">
                                                Version {document?.version || 1}
                                            </span>
                                            <Badge className="bg-green-600 text-white">Current</Badge>
                                        </div>
                                        <p className="text-sm text-blue-200 font-medium mb-2">{document?.file_name}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-300">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" />
                                                {document?.uploaded_by_name || document?.created_by}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {format(new Date(document?.updated_date), 'MMM d, yyyy h:mm a')}
                                            </span>
                                            <span className="text-blue-400/70">
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
                                        className="border-l-4 border-blue-900/40 pl-4 py-4 hover:bg-blue-950/40 rounded-r transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium text-white">
                                                        Version {version.version_number}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-blue-200 mb-1">{version.file_name}</p>
                                                {version.change_notes && (
                                                    <p className="text-sm text-blue-300 italic mb-2 bg-blue-950/50 rounded px-2 py-1">
                                                        "{version.change_notes}"
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-400/70">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        {version.uploaded_by_name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {format(new Date(version.created_date), 'MMM d, yyyy h:mm a')}
                                                    </span>
                                                    <span className="text-blue-400/60">
                                                        {formatFileSize(version.file_size)}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleDownload(version.file_url)}
                                                className="text-blue-300 hover:text-white"
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-blue-400/70">
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