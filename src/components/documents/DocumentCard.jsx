import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { FileText, Download, Eye, MoreVertical, Clock, Upload, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { toast } from 'sonner';
import VersionHistoryDialog from './VersionHistoryDialog';
import NewVersionDialog from './NewVersionDialog';

export default function DocumentCard({ document, currentFolderId }) {
    const [versionDialogOpen, setVersionDialogOpen] = useState(false);
    const [newVersionDialogOpen, setNewVersionDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id) => httpClient.entities.Document.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['documents']);
            toast.success('Document deleted');
        }
    });

    const handleDownload = () => {
        window.open(document.file_url, '_blank');
    };

    const handlePreview = () => {
        const fileType = document.file_type || '';
        if (fileType.includes('pdf') || fileType.includes('image')) {
            window.open(document.file_url, '_blank');
        } else {
            handleDownload();
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e90ff] to-[#0066cc] flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handlePreview}>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setVersionDialogOpen(true)}>
                                <Clock className="w-4 h-4 mr-2" />
                                Version History
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setNewVersionDialogOpen(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload New Version
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate(document.id)}
                                className="text-red-600"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h3 className="font-semibold text-slate-900 mb-1 truncate">{document.name}</h3>
                {document.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{document.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                    {document.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span>{formatFileSize(document.file_size)}</span>
                    <span>v{document.version}</span>
                    <span>{format(new Date(document.created_date), 'MMM d')}</span>
                </div>
            </div>

            <VersionHistoryDialog
                open={versionDialogOpen}
                onOpenChange={setVersionDialogOpen}
                document={document}
            />

            <NewVersionDialog
                open={newVersionDialogOpen}
                onOpenChange={setNewVersionDialogOpen}
                document={document}
                currentFolderId={currentFolderId}
            />
        </>
    );
}