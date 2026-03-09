import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Folder, Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ManageFolders() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [deleteFolder, setDeleteFolder] = useState(null);
    const [editingFolder, setEditingFolder] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#1e90ff'
    });
    
    const { data: folders = [], isLoading } = useQuery({
        queryKey: ['document-folders'],
        queryFn: () => base44.entities.DocumentFolder.list()
    });
    
    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.DocumentFolder.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['document-folders']);
            setShowDialog(false);
            resetForm();
            toast.success('Folder created');
        }
    });
    
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.DocumentFolder.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['document-folders']);
            setShowDialog(false);
            resetForm();
            toast.success('Folder updated');
        }
    });
    
    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.DocumentFolder.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['document-folders']);
            setDeleteFolder(null);
            toast.success('Folder deleted');
        }
    });
    
    const resetForm = () => {
        setFormData({ name: '', description: '', color: '#1e90ff' });
        setEditingFolder(null);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingFolder) {
            updateMutation.mutate({ id: editingFolder.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };
    
    const handleEdit = (folder) => {
        setEditingFolder(folder);
        setFormData({
            name: folder.name,
            description: folder.description || '',
            color: folder.color || '#1e90ff'
        });
        setShowDialog(true);
    };
    
    const colors = [
        '#1e90ff', '#0066cc', '#4da6ff',
        '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#6366f1'
    ];
    
    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(createPageUrl('Documents'))}
                            className="rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Manage Folders</h1>
                            <p className="text-sm text-slate-600">{folders.length} folders</p>
                        </div>
                    </div>
                    
                    <Dialog open={showDialog} onOpenChange={(open) => {
                        setShowDialog(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                New Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingFolder ? 'Edit Folder' : 'Create Folder'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div>
                                    <Label htmlFor="name">Folder Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter folder name"
                                        className="mt-2"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter folder description"
                                        className="mt-2"
                                        rows={3}
                                    />
                                </div>
                                
                                <div>
                                    <Label>Folder Color</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-8 h-8 rounded-lg transition-transform ${
                                                    formData.color === color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''
                                                }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white"
                                >
                                    {editingFolder ? 'Update Folder' : 'Create Folder'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
                                <div className="h-5 w-1/3 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : folders.length > 0 ? (
                    <div className="grid gap-4">
                        {folders.map(folder => (
                            <div key={folder.id} className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: folder.color + '20' }}
                                        >
                                            <Folder className="w-5 h-5" style={{ color: folder.color }} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{folder.name}</h3>
                                            {folder.description && (
                                                <p className="text-sm text-slate-600">{folder.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(folder)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteFolder(folder)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                        <Folder className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No folders yet</h3>
                        <p className="text-slate-600 mb-4">Create folders to organize your documents</p>
                        <Button
                            onClick={() => setShowDialog(true)}
                            className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Folder
                        </Button>
                    </div>
                )}
            </div>
            
            {/* Delete Dialog */}
            <AlertDialog open={!!deleteFolder} onOpenChange={() => setDeleteFolder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteFolder?.name}"? Documents in this folder will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(deleteFolder.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}