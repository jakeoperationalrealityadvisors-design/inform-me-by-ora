import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NewVersionDialog({ open, onOpenChange, document, currentFolderId }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const uploadMutation = useMutation({
        mutationFn: async (newFile) => {
            setUploading(true);
            
            // Upload new file
            const { file_url } = await base44.integrations.Core.UploadFile({ file: newFile });
            
            // Mark old version as not latest
            await base44.entities.Document.update(document.id, {
                is_latest_version: false
            });
            
            // Create new version
            return base44.entities.Document.create({
                name: document.name,
                description: document.description,
                file_url,
                file_type: newFile.type,
                file_size: newFile.size,
                folder_id: currentFolderId,
                tags: document.tags,
                uploaded_by_name: user?.full_name || user?.email,
                version: document.version + 1,
                parent_document_id: document.id,
                is_latest_version: true
            });
        },
        onSuccess: () => {
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

        uploadMutation.mutate(file);
    };

    const handleClose = () => {
        setFile(null);
        setUploading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={uploading ? undefined : handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload New Version</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-600 mb-4">
                            Current version: <strong>v{document?.version}</strong>
                        </p>
                        <p className="text-sm text-slate-600 mb-4">
                            Upload a new file to create version <strong>v{document?.version + 1}</strong>
                        </p>
                    </div>

                    <div>
                        <Label>Select File</Label>
                        <div className="mt-2">
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#1e90ff] transition-colors">
                                <div className="text-center">
                                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600">
                                        {file ? file.name : 'Click to select file'}
                                    </p>
                                    {file && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
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