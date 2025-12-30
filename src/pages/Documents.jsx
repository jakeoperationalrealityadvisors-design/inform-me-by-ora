import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, FileText, Folder, Search, Filter, Download, Trash2, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { useUserRole } from '@/components/auth/RoleGuard';
import { format } from 'date-fns';

export default function Documents() {
    const [search, setSearch] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const { user } = useUserRole();
    
    const { data: documents = [], isLoading: docsLoading } = useQuery({
        queryKey: ['documents'],
        queryFn: () => base44.entities.Document.filter({ status: 'active' }, '-created_date')
    });
    
    const { data: folders = [] } = useQuery({
        queryKey: ['document-folders'],
        queryFn: () => base44.entities.DocumentFolder.list()
    });
    
    // Get all unique tags
    const allTags = [...new Set(documents.flatMap(doc => doc.tags || []))];
    
    // Filter documents
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = !search || 
            doc.title.toLowerCase().includes(search.toLowerCase()) ||
            doc.description?.toLowerCase().includes(search.toLowerCase());
        const matchesFolder = !selectedFolder || doc.folder_id === selectedFolder;
        const matchesTags = selectedTags.length === 0 || 
            selectedTags.some(tag => doc.tags?.includes(tag));
        return matchesSearch && matchesFolder && matchesTags;
    });
    
    const getFolderName = (id) => folders.find(f => f.id === id)?.name || 'Uncategorized';
    
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    
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
                                <p className="text-sm text-slate-600">{documents.length} documents</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link to={createPageUrl('ManageFolders')}>
                                <Button variant="outline" className="gap-2">
                                    <Folder className="w-4 h-4" />
                                    Folders
                                </Button>
                            </Link>
                            <Link to={createPageUrl('UploadDocument')}>
                                <Button className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white gap-2">
                                    <Upload className="w-4 h-4" />
                                    Upload
                                </Button>
                            </Link>
                        </div>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search documents..."
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-3">Folders</h3>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedFolder(null)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                        selectedFolder === null
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    All Documents
                                </button>
                                {folders.map(folder => (
                                    <button
                                        key={folder.id}
                                        onClick={() => setSelectedFolder(folder.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                                            selectedFolder === folder.id
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Folder className="w-4 h-4" style={{ color: folder.color }} />
                                        {folder.name}
                                    </button>
                                ))}
                            </div>
                            
                            {allTags.length > 0 && (
                                <>
                                    <h3 className="font-semibold text-slate-900 mb-3 mt-6">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {allTags.map(tag => (
                                            <Badge
                                                key={tag}
                                                onClick={() => {
                                                    if (selectedTags.includes(tag)) {
                                                        setSelectedTags(selectedTags.filter(t => t !== tag));
                                                    } else {
                                                        setSelectedTags([...selectedTags, tag]);
                                                    }
                                                }}
                                                className={`cursor-pointer ${
                                                    selectedTags.includes(tag)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Documents Grid */}
                    <div className="lg:col-span-3">
                        {docsLoading ? (
                            <div className="grid gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-5 animate-pulse">
                                        <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
                                        <div className="h-4 w-1/2 bg-slate-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredDocs.length > 0 ? (
                            <div className="grid gap-4">
                                {filteredDocs.map((doc, idx) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Link to={createPageUrl(`ViewDocument?id=${doc.id}`)}>
                                            <div className="bg-white rounded-lg border border-slate-200 p-5 hover:border-blue-400 hover:shadow-lg transition-all group">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4 flex-1">
                                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e90ff] to-[#0066cc] flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                                {doc.title}
                                                            </h3>
                                                            {doc.description && (
                                                                <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                                                                    {doc.description}
                                                                </p>
                                                            )}
                                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                                                <span>{doc.file_name}</span>
                                                                <span>•</span>
                                                                <span>{formatFileSize(doc.file_size)}</span>
                                                                <span>•</span>
                                                                <span>v{doc.version || 1}</span>
                                                                {doc.folder_id && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Folder className="w-3 h-3" />
                                                                            {getFolderName(doc.folder_id)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {doc.tags && doc.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {doc.tags.map(tag => (
                                                                        <Badge key={tag} className="bg-slate-100 text-slate-600 text-xs">
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {format(new Date(doc.created_date), 'MMM d, yyyy')}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No documents found</h3>
                                <p className="text-slate-600 mb-4">
                                    {search || selectedFolder || selectedTags.length > 0
                                        ? 'Try adjusting your filters'
                                        : 'Upload your first document to get started'}
                                </p>
                                <Link to={createPageUrl('UploadDocument')}>
                                    <Button className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc] text-white">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}