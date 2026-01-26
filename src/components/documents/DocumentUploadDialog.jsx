import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

export default function DocumentUploadDialog({ open, onOpenChange, currentFolderId, user }) {
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [uploading, setUploading] = useState(false);

    const queryClient = useQueryClient();

    const { data: existingTags = [] } = useQuery({
        queryKey: ['document-tags'],
        queryFn: () => httpClient.entities.DocumentTag.list()
    });

    const uploadMutation = useMutation({
        mutationFn: async (data) => {
            // First upload file
            setUploading(true);
            const { file_url } = await httpClient.integrations.Core.UploadFile({ file: data.file });
            
            // Create document record
            return httpClient.entities.Document.create({
                name: data.name,
                description: data.description,
                file_url,
                file_type: data.file.type,
                file_size: data.file.size,
                folder_id: currentFolderId,
                tags: data.tags,
                uploaded_by_name: user?.full_name || user?.email,
                version: 1,
                is_latest_version: true
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['documents']);
            toast.success('Document uploaded successfully');
            handleClose();
        },
        onError: (error) => {
            toast.error('Failed to upload document');
            setUploading(false);
        }
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!name) setName(selectedFile.name);
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            const newTag = tagInput.trim();
            setTags([...tags, newTag]);
            
            // Create tag if it doesn't exist
            if (!existingTags.find(t => t.name === newTag)) {
                httpClient.entities.DocumentTag.create({ name: newTag, color: '#1e90ff' });
            }
            
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = () => {
        if (!file || !name) {
            toast.error('Please select a file and provide a name');
            return;
        }

        uploadMutation.mutate({
            file,
            name,
            description,
            tags
        });
    };

    const handleClose = () => {
        setFile(null);
        setName('');
        setDescription('');
        setTags([]);
        setTagInput('');
        setUploading(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={uploading ? undefined : handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File Upload */}
                    <div>
                        <Label>File</Label>
                        <div className="mt-2">
                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#1e90ff] transition-colors">
                                <div className="text-center">
                                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600">
                                        {file ? file.name : 'Click to select file'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {file && `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                    </p>
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

                    {/* Name */}
                    <div>
                        <Label>Document Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter document name"
                            disabled={uploading}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Description (optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description"
                            rows={3}
                            disabled={uploading}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <Label>Tags (optional)</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Add tag"
                                disabled={uploading}
                            />
                            <Button onClick={addTag} variant="outline" disabled={uploading}>
                                Add
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} disabled={uploading}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!file || !name || uploading}
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
                                Upload
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}