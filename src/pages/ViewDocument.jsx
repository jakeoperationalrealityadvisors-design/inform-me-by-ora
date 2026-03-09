import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Download, Upload, History, Trash2, Folder, Clock, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { toast } from "sonner";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from 'react-router-dom';
import DocumentLinkSelector from '@/components/documents/DocumentLinkSelector';
import DocumentPermissionsEditor from '@/components/documents/DocumentPermissionsEditor';
import { FileText as FormIcon, CheckSquare as ChecklistIcon, ListTodo as TaskIcon, ExternalLink } from 'lucide-react';
import AIDocumentAnalysis from '@/components/ai/AIDocumentAnalysis';

export default function ViewDocument() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('id');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showVersionDialog, setShowVersionDialog] = useState(false);
    const [newVersionFile, setNewVersionFile] = useState(null);
    const [versionNotes, setVersionNotes] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const { data: document, isLoading } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => base44.entities.Document.filter({ id: documentId }).then(docs => docs[0]),
        enabled: !!documentId
    });
    
    const { data: folder } = useQuery({
        queryKey: ['folder', document?.folder_id],
        queryFn: () => base44.entities.DocumentFolder.filter({ id: document.folder_id }).then(f => f[0]),
        enabled: !!document?.folder_id
    });
    
    const { data: versions = [] } = useQuery({
        queryKey: ['document-versions', documentId],
        queryFn: () => base44.entities.DocumentVersion.filter({ document_id: documentId }, '-version_number'),
        enabled: !!documentId
    });
    
    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    const updateLinksMutation = useMutation({
        mutationFn: (links) => base44.entities.Document.update(documentId, { linked_to: links }),
        onSuccess: () => {
            queryClient.invalidateQueries(['document', documentId]);
            toast.success('Links updated');
        }
    });
    
    const updatePermissionsMutation = useMutation({
        mutationFn: (perms) => base44.entities.Document.update(documentId, { permissions: perms }),
        onSuccess: () => {
            queryClient.invalidateQueries(['document', documentId]);
            toast.success('Permissions updated');
        }
    });
    
    const deleteMutation = useMutation({
        mutationFn: () => base44.entities.Document.update(documentId, { status: 'archived' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['documents']);
            toast.success('Document deleted');
            navigate(createPageUrl('Documents'));
        }
    });
    
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    
    const handleUploadVersion = async () => {
        if (!newVersionFile) {
            toast.error('Please select a file');
            return;
        }
        
        setUploading(true);
        
        try {
            // Upload new file
            const uploadResult = await base44.integrations.Core.UploadFile({ file: newVersionFile });
            
            const newVersion = (document.version || 1) + 1;
            
            // Create version record
            await base44.entities.DocumentVersion.create({
                document_id: documentId,
                version_number: newVersion,
                file_url: uploadResult.file_url,
                file_name: newVersionFile.name,
                file_size: newVersionFile.size,
                uploaded_by_name: user?.full_name || user?.email,
                change_notes: versionNotes
            });
            
            // Update document with new version
            await base44.entities.Document.update(documentId, {
                file_url: uploadResult.file_url,
                file_name: newVersionFile.name,
                file_size: newVersionFile.size,
                version: newVersion
            });
            
            queryClient.invalidateQueries(['document', documentId]);
            queryClient.invalidateQueries(['document-versions', documentId]);
            
            setShowVersionDialog(false);
            setNewVersionFile(null);
            setVersionNotes('');
            toast.success('New version uploaded');
        } catch (error) {
            toast.error('Failed to upload new version');
        } finally {
            setUploading(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-slate-600">Loading...</div>
            </div>
        );
    }
    
    if (!document) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Document not found</h2>
                    <Button onClick={() => navigate(createPageUrl('Documents'))}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
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
                                <h1 className="text-xl font-bold text-slate-900">{document.title}</h1>
                                <p className="text-sm text-slate-600">Version {document.version || 1}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <a href={document.file_url} download target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Download
                                </Button>
                            </a>
                            <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Upload className="w-4 h-4" />
                                        New Version
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Upload New Version</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <div>
                                            <Label>Select File</Label>
                                            <input
                                                type="file"
                                                onChange={(e) => setNewVersionFile(e.target.files[0])}
                                                className="mt-2 w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <Label>Version Notes</Label>
                                            <Textarea
                                                value={versionNotes}
                                                onChange={(e) => setVersionNotes(e.target.value)}
                                                placeholder="Describe what changed in this version"
                                                className="mt-2"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleUploadVersion}
                                            disabled={!newVersionFile || uploading}
                                            className="w-full bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Version'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* AI Document Analysis */}
                        <AIDocumentAnalysis document={document} />
                        {/* Document Info */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Document Information</h2>
                            
                            {document.description && (
                                <div className="mb-4">
                                    <p className="text-slate-600">{document.description}</p>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500">File Name:</span>
                                    <p className="font-medium text-slate-900">{document.file_name}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">File Size:</span>
                                    <p className="font-medium text-slate-900">{formatFileSize(document.file_size)}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">File Type:</span>
                                    <p className="font-medium text-slate-900">{document.file_type || 'Unknown'}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">Uploaded By:</span>
                                    <p className="font-medium text-slate-900">{document.uploaded_by_name || document.created_by}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500">Created:</span>
                                    <p className="font-medium text-slate-900">
                                        {format(new Date(document.created_date), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-500">Last Modified:</span>
                                    <p className="font-medium text-slate-900">
                                        {format(new Date(document.updated_date), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                            </div>
                            
                            {document.tags && document.tags.length > 0 && (
                                <div className="mt-4">
                                    <span className="text-slate-500 text-sm">Tags:</span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {document.tags.map(tag => (
                                            <Badge key={tag} className="bg-blue-100 text-blue-700">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Version History */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <History className="w-5 h-5 text-slate-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">Version History</h2>
                                </div>
                                <Badge className="bg-blue-100 text-blue-700">
                                    {versions.length + 1} version{versions.length !== 0 ? 's' : ''}
                                </Badge>
                            </div>
                            
                            <div className="space-y-3">
                                {/* Current Version */}
                                <div className="border-l-4 border-green-600 pl-4 py-3 bg-green-50/50 rounded-r">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-slate-900">
                                                    Version {document.version || 1}
                                                </p>
                                                <Badge className="bg-green-600 text-white text-xs">Current</Badge>
                                            </div>
                                            <p className="text-sm text-slate-600">{document.file_name}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {document.uploaded_by_name || document.created_by}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(document.updated_date), 'MMM d, yyyy h:mm a')}
                                                </span>
                                                <span className="text-slate-400">
                                                    {formatFileSize(document.file_size)}
                                                </span>
                                            </div>
                                        </div>
                                        <a href={document.file_url} download target="_blank" rel="noopener noreferrer">
                                            <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-100">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                                
                                {/* Previous Versions */}
                                {versions.length > 0 ? (
                                    versions.map((version, idx) => (
                                        <div key={version.id} className="border-l-4 border-slate-300 pl-4 py-3 hover:bg-slate-50 rounded-r transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-slate-900">
                                                            Version {version.version_number}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{version.file_name}</p>
                                                    {version.change_notes && (
                                                        <p className="text-sm text-slate-500 mt-1 italic">"{version.change_notes}"</p>
                                                    )}
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {version.uploaded_by_name}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {format(new Date(version.created_date), 'MMM d, yyyy h:mm a')}
                                                        </span>
                                                        <span className="text-slate-400">
                                                            {formatFileSize(version.file_size)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <a href={version.file_url} download target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-sm text-center py-4">No previous versions</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {folder && (
                            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Folder className="w-5 h-5" style={{ color: folder.color }} />
                                    <h3 className="font-semibold text-slate-900">Folder</h3>
                                </div>
                                <p className="text-slate-600">{folder.name}</p>
                                {folder.description && (
                                    <p className="text-sm text-slate-500 mt-2">{folder.description}</p>
                                )}
                            </div>
                        )}
                        
                        {/* Linked Items */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Linked Items</h3>
                                <DocumentLinkSelector
                                    currentLinks={document?.linked_to || {}}
                                    onLinksUpdate={(links) => updateLinksMutation.mutate(links)}
                                    trigger={
                                        <Button variant="ghost" size="sm">
                                            Edit
                                        </Button>
                                    }
                                />
                            </div>
                            
                            {document?.linked_to?.form_submission_id && (
                                <Link 
                                    to={createPageUrl(`ViewFormSubmission?id=${document.linked_to.form_submission_id}`)}
                                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors mb-2"
                                >
                                    <FormIcon className="w-4 h-4 text-blue-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-blue-900 truncate">
                                            {document.linked_to.form_title}
                                        </p>
                                        <p className="text-xs text-blue-600">Form Submission</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-blue-600" />
                                </Link>
                            )}
                            
                            {document?.linked_to?.checklist_submission_id && (
                                <Link 
                                    to={createPageUrl(`ViewChecklistSubmission?id=${document.linked_to.checklist_submission_id}`)}
                                    className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors mb-2"
                                >
                                    <ChecklistIcon className="w-4 h-4 text-green-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-green-900 truncate">
                                            {document.linked_to.checklist_title}
                                        </p>
                                        <p className="text-xs text-green-600">Checklist Submission</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-green-600" />
                                </Link>
                            )}
                            
                            {document?.linked_to?.task_id && (
                                <Link 
                                    to={createPageUrl(`MyTasks`)}
                                    className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors mb-2"
                                >
                                    <TaskIcon className="w-4 h-4 text-purple-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-purple-900 truncate">
                                            {document.linked_to.task_title}
                                        </p>
                                        <p className="text-xs text-purple-600">Task</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-purple-600" />
                                </Link>
                            )}
                            
                            {!document?.linked_to?.form_submission_id && 
                             !document?.linked_to?.checklist_submission_id && 
                             !document?.linked_to?.task_id && (
                                <p className="text-sm text-slate-500 text-center py-4">No linked items</p>
                            )}
                        </div>
                        
                        {/* Permissions */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Access</h3>
                                <DocumentPermissionsEditor
                                    currentPermissions={document?.permissions || {}}
                                    onPermissionsUpdate={(perms) => updatePermissionsMutation.mutate(perms)}
                                    trigger={
                                        <Button variant="ghost" size="sm">
                                            Edit
                                        </Button>
                                    }
                                />
                            </div>
                            
                            {document?.permissions?.is_public ? (
                                <Badge className="bg-green-100 text-green-700 w-full justify-center">
                                    Public Document
                                </Badge>
                            ) : (
                                <div className="space-y-2">
                                    {document?.permissions?.can_view?.length > 0 ? (
                                        <>
                                            <p className="text-xs text-slate-500">Shared with {document.permissions.can_view.length} user{document.permissions.can_view.length !== 1 ? 's' : ''}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-2">Private</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{document.title}"? This will archive the document and all its versions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate()}
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