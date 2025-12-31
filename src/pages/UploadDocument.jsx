import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Upload, FileText, Loader2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { logActivity } from '@/components/activity/ActivityLogger';

export default function UploadDocument() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        folder_id: '',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    const { data: folders = [] } = useQuery({
        queryKey: ['document-folders'],
        queryFn: () => base44.entities.DocumentFolder.list()
    });
    
    const createDocMutation = useMutation({
        mutationFn: (docData) => base44.entities.Document.create(docData),
        onSuccess: () => {
            queryClient.invalidateQueries(['documents']);
            toast.success('Document uploaded successfully');
            navigate(createPageUrl('Documents'));
        }
    });
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            if (!formData.title) {
                setFormData({ ...formData, title: selectedFile.name });
            }
        }
    };
    
    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };
    
    const removeTag = (tag) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }
        
        if (!formData.title) {
            toast.error('Please enter a document title');
            return;
        }
        
        setUploading(true);
        
        try {
            // Upload file
            const uploadResult = await base44.integrations.Core.UploadFile({ file });
            
            // Create document record
            const newDoc = await createDocMutation.mutateAsync({
                title: formData.title,
                description: formData.description,
                file_url: uploadResult.file_url,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                folder_id: formData.folder_id || null,
                tags: formData.tags,
                version: 1,
                uploaded_by_name: user?.full_name || user?.email
            });
            
            await logActivity({
                action_type: 'document_uploaded',
                entity_type: 'document',
                entity_id: newDoc.id,
                entity_title: formData.title,
                description: `Uploaded document: ${formData.title}`,
                metadata: { file_name: file.name, file_size: file.size }
            });
        } catch (error) {
            toast.error('Failed to upload document');
            setUploading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(createPageUrl('Documents'))}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Upload Document</h1>
                        <p className="text-sm text-slate-600">Add a new document to your library</p>
                    </div>
                </div>
            </div>
            
            <div className="max-w-3xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
                    {/* File Upload */}
                    <div>
                        <Label>File</Label>
                        <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <>
                                            <FileText className="w-10 h-10 text-blue-600 mb-3" />
                                            <p className="text-sm text-slate-700 font-medium">{file.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-slate-400 mb-3" />
                                            <p className="text-sm text-slate-600">
                                                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-500">Any file type supported</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>
                    
                    {/* Title */}
                    <div>
                        <Label htmlFor="title">Document Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter document title"
                            className="mt-2"
                            required
                        />
                    </div>
                    
                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter document description"
                            className="mt-2"
                            rows={3}
                        />
                    </div>
                    
                    {/* Folder */}
                    <div>
                        <Label>Folder</Label>
                        <Select
                            value={formData.folder_id}
                            onValueChange={(value) => setFormData({ ...formData, folder_id: value })}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select a folder (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>No Folder</SelectItem>
                                {folders.map(folder => (
                                    <SelectItem key={folder.id} value={folder.id}>
                                        {folder.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Tags */}
                    <div>
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                placeholder="Add tags"
                            />
                            <Button type="button" onClick={addTag} variant="outline">
                                Add
                            </Button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.tags.map(tag => (
                                    <Badge key={tag} className="bg-blue-100 text-blue-700 gap-1">
                                        {tag}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(createPageUrl('Documents'))}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading || !file}
                            className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Document
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}