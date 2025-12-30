import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function VersionHistoryDialog({ open, onOpenChange, document }) {
    const { data: versions = [], isLoading } = useQuery({
        queryKey: ['document-versions', document?.id],
        queryFn: async () => {
            // Get all versions including current
            const allDocs = await base44.entities.Document.list('-version');
            
            // Build version chain
            const versionChain = [];
            let current = document;
            
            while (current) {
                versionChain.push(current);
                if (current.parent_document_id) {
                    current = allDocs.find(d => d.id === current.parent_document_id);
                } else {
                    break;
                }
            }
            
            return versionChain.sort((a, b) => b.version - a.version);
        },
        enabled: open && !!document
    });

    const handleDownload = (fileUrl) => {
        window.open(fileUrl, '_blank');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Version History - {document?.name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-500">Loading versions...</div>
                    ) : versions.length > 0 ? (
                        versions.map((version, idx) => (
                            <div 
                                key={version.id}
                                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">
                                                Version {version.version}
                                            </span>
                                            {version.is_latest_version && (
                                                <Badge className="bg-green-100 text-green-700 text-xs">
                                                    Current
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {format(new Date(version.created_date), 'MMM d, yyyy h:mm a')}
                                        </p>
                                        {version.uploaded_by_name && (
                                            <p className="text-xs text-slate-500">by {version.uploaded_by_name}</p>
                                        )}
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownload(version.file_url)}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-slate-500">No version history available</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}