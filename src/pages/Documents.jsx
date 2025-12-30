import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Upload, FolderPlus, Search, Filter, FileText, Folder as FolderIcon, Download, Eye, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import FolderDialog from '@/components/documents/FolderDialog';
import DocumentCard from '@/components/documents/DocumentCard';
import FolderCard from '@/components/documents/FolderCard';
import TagFilter from '@/components/documents/TagFilter';

export default function Documents() {
    const [search, setSearch] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);

    const { data: documents = [], isLoading: docsLoading } = useQuery({
        queryKey: ['documents', currentFolderId],
        queryFn: () => base44.entities.Document.filter({ 
            folder_id: currentFolderId || null,
            is_latest_version: true 
        })
    });

    const { data: folders = [], isLoading: foldersLoading } = useQuery({
        queryKey: ['folders', currentFolderId],
        queryFn: () => base44.entities.Folder.filter({ 
            parent_folder_id: currentFolderId || null 
        })
    });

    const { data: allFolders = [] } = useQuery({
        queryKey: ['all-folders'],
        queryFn: () => base44.entities.Folder.list()
    });

    const { data: tags = [] } = useQuery({
        queryKey: ['document-tags'],
        queryFn: () => base44.entities.DocumentTag.list()
    });

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const currentFolder = allFolders.find(f => f.id === currentFolderId);
    const breadcrumbs = [];
    let tempFolder = currentFolder;
    while (tempFolder) {
        breadcrumbs.unshift(tempFolder);
        tempFolder = allFolders.find(f => f.id === tempFolder.parent_folder_id);
    }

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = !search || doc.name.toLowerCase().includes(search.toLowerCase());
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => doc.tags?.includes(tag));
        return matchesSearch && matchesTags;
    });

    const isLoading = docsLoading || foldersLoading;

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Document Management</h1>
                                <p className="text-sm text-slate-600">Upload, organize, and manage documents</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                onClick={() => setFolderDialogOpen(true)}
                                variant="outline"
                                className="gap-2"
                            >
                                <FolderPlus className="w-4 h-4" />
                                New Folder
                            </Button>
                            <Button 
                                onClick={() => setUploadDialogOpen(true)}
                                className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Upload
                            </Button>
                        </div>
                    </div>

                    {/* Breadcrumbs */}
                    {breadcrumbs.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                            <button 
                                onClick={() => setCurrentFolderId(null)}
                                className="hover:text-[#1e90ff] transition-colors"
                            >
                                Root
                            </button>
                            {breadcrumbs.map((folder) => (
                                <React.Fragment key={folder.id}>
                                    <span>/</span>
                                    <button 
                                        onClick={() => setCurrentFolderId(folder.id)}
                                        className="hover:text-[#1e90ff] transition-colors"
                                    >
                                        {folder.name}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Search & Filters */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search documents..."
                                className="pl-10"
                            />
                        </div>
                        {tags.length > 0 && (
                            <TagFilter 
                                tags={tags}
                                selected={selectedTags}
                                onSelect={setSelectedTags}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
                                <div className="h-12 w-12 bg-slate-200 rounded-lg mb-3" />
                                <div className="h-5 bg-slate-200 rounded mb-2" />
                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Folders */}
                        {folders.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-sm font-semibold text-slate-700 mb-3">Folders</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {folders.map((folder, idx) => (
                                        <motion.div
                                            key={folder.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <FolderCard 
                                                folder={folder}
                                                onClick={() => setCurrentFolderId(folder.id)}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {filteredDocuments.length > 0 ? (
                            <div>
                                <h2 className="text-sm font-semibold text-slate-700 mb-3">Documents</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredDocuments.map((doc, idx) => (
                                        <motion.div
                                            key={doc.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: (folders.length + idx) * 0.05 }}
                                        >
                                            <DocumentCard 
                                                document={doc}
                                                currentFolderId={currentFolderId}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : folders.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No documents yet</h3>
                                <p className="text-slate-500 mb-4">Upload your first document to get started</p>
                                <Button onClick={() => setUploadDialogOpen(true)} className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc]">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Document
                                </Button>
                            </div>
                        ) : null}
                    </>
                )}
            </div>

            <DocumentUploadDialog 
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                currentFolderId={currentFolderId}
                user={user}
            />

            <FolderDialog
                open={folderDialogOpen}
                onOpenChange={setFolderDialogOpen}
                currentFolderId={currentFolderId}
            />
        </div>
    );
}