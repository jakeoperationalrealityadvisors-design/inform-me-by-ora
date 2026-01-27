import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, FileUp } from 'lucide-react';
import { toast } from 'sonner';

export default function NewVersionDialog({ open, onOpenChange, document }) {
    const [file, setFile] = useState(null);
    const [changeNotes, setChangeNotes] = useState('');
    const [uploading, setUploading] = useState(false);

    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => httpClient.auth.me()
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ newFile, notes }) => {
            setUploading(true);
            
            // Upload new file
            const { file_url } = await httpClient.integrations.Core.UploadFile({ file: newFile });
            
            const newVersion = (document.version || 1) + 1;
            
            // Create version record for old file
            await httpClient.entities.DocumentVersion.create({
                document_id: document.id,
                version_number: document.version || 1,
                file_url: document.file_url,
                file_name: document.file_name,
                file_size: document.file_size,
                uploaded_by_name: document.uploaded_by_name || document.created_by,
                change_notes: notes
            });
            
            // Update document with new version
            return httpClient.entities.Document.update(document.id, {
                file_url,
                file_name: newFile.name,
                file_size: newFile.size,
                file_type: newFile.type,
                version: newVersion,
                uploaded_by_name: user?.full_name || user?.email
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['document', document.id]);
            queryClient.invalidateQueries(['document-versions', document.id]);
            queryClient.invalidateQueries(['documents']);
            toast.success('New version uploaded successfully');
            handleClose();
        },
        onError: () => {
            toast.error('Failed to upload new version');
            setUploading(false);
        }
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        uploadMutation.mutate({ newFile: file, notes: changeNotes });
    };

    const handleClose = () => {
        setFile(null);
        setChangeNotes('');
        setUploading(false);
        onOpenChange(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <Dialog open={open} onOpenChange={uploading ? undefined : handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload New Version</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                            Current version: <strong>v{document?.version || 1}</strong>
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            New version will be: <strong>v{(document?.version || 1) + 1}</strong>
                        </p>
                    </div>

                    <div>
                        <Label>Select File *</Label>
                        <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-900/40 rounded-lg cursor-pointer hover:border-[#1e90ff] hover:bg-blue-950/40/50 transition-all">
                                <div className="text-center p-4">
                                    {file ? (
                                        <>
                                            <FileUp className="w-8 h-8 mx-auto text-green-600 mb-2" />
                                            <p className="text-sm font-medium text-white">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-blue-400/70 mt-1">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 mx-auto text-blue-400/60 mb-2" />
                                            <p className="text-sm text-blue-300">
                                                Click to select file
                                            </p>
                                            <p className="text-xs text-blue-400/70 mt-1">
                                                Any file type accepted
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <Label>Change Notes (optional)</Label>
                        <Textarea
                            value={changeNotes}
                            onChange={(e) => setChangeNotes(e.target.value)}
                            placeholder="Describe what changed in this version..."
                            className="mt-2 resize-none"
                            rows={3}
                            disabled={uploading}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!file || uploading}
                        className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc]"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Version
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}