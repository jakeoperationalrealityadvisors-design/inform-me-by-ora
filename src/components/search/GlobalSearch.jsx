import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, CheckSquare, FolderOpen, ListTodo, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { useLanguage } from '@/components/language/LanguageContext';

export default function GlobalSearch({ open, onOpenChange }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const { t } = useLanguage();
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    
    const { data: results, isLoading } = useQuery({
        queryKey: ['global-search', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) return null;
            
            const query = debouncedQuery.toLowerCase();
            
            const [forms, checklists, documents, formTasks, checklistTasks] = await Promise.all([
                httpClient.entities.FormTemplate.filter({ status: 'active' }),
                httpClient.entities.ChecklistTemplate.filter({ status: 'active' }),
                httpClient.entities.Document.filter({ status: 'active' }),
                httpClient.entities.FormSubmission.list('-created_date', 50),
                httpClient.entities.ChecklistSubmission.list('-created_date', 50),
            ]);
            
            const matchedForms = forms.filter(f => 
                f.title?.toLowerCase().includes(query) || 
                f.description?.toLowerCase().includes(query)
            );
            
            const matchedChecklists = checklists.filter(c => 
                c.title?.toLowerCase().includes(query) || 
                c.description?.toLowerCase().includes(query)
            );
            
            const matchedDocuments = documents.filter(d => 
                d.title?.toLowerCase().includes(query) || 
                d.description?.toLowerCase().includes(query) ||
                d.file_name?.toLowerCase().includes(query) ||
                d.tags?.some(tag => tag.toLowerCase().includes(query))
            );
            
            const matchedFormTasks = formTasks.filter(t => 
                t.form_title?.toLowerCase().includes(query) ||
                t.assigned_to_email?.toLowerCase().includes(query) ||
                t.location?.toLowerCase().includes(query)
            );
            
            const matchedChecklistTasks = checklistTasks.filter(t => 
                t.checklist_title?.toLowerCase().includes(query) ||
                t.assigned_to_email?.toLowerCase().includes(query) ||
                t.location?.toLowerCase().includes(query)
            );
            
            return {
                forms: matchedForms.slice(0, 5),
                checklists: matchedChecklists.slice(0, 5),
                documents: matchedDocuments.slice(0, 5),
                tasks: [...matchedFormTasks, ...matchedChecklistTasks].slice(0, 10)
            };
        },
        enabled: open && debouncedQuery.length >= 2
    });
    
    const handleClose = () => {
        setSearchQuery('');
        setDebouncedQuery('');
        onOpenChange(false);
    };
    
    const totalResults = results ? 
        results.forms.length + results.checklists.length + results.documents.length + results.tasks.length : 0;
    
    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] p-0">
                <div className="sticky top-0 bg-white z-10 p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search forms, checklists, documents, tasks..."
                            className="pl-10 pr-4 h-12 text-lg border-slate-300 focus:border-blue-500"
                            autoFocus
                        />
                    </div>
                    {debouncedQuery && (
                        <p className="text-sm text-slate-600 mt-2">
                            {isLoading ? 'Searching...' : `Found ${totalResults} results`}
                        </p>
                    )}
                </div>
                
                <div className="overflow-y-auto p-4 space-y-6">
                    {!debouncedQuery || debouncedQuery.length < 2 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>Type at least 2 characters to search</p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                        </div>
                    ) : !results || totalResults === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <p>No results found for "{debouncedQuery}"</p>
                        </div>
                    ) : (
                        <>
                            {results.forms.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {t('common.forms')} ({results.forms.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.forms.map(form => (
                                            <Link
                                                key={form.id}
                                                to={createPageUrl(`FillForm?id=${form.id}`)}
                                                onClick={handleClose}
                                                className="block p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                                            >
                                                <p className="font-medium text-slate-900">{form.title}</p>
                                                {form.description && (
                                                    <p className="text-sm text-slate-600 line-clamp-1 mt-1">{form.description}</p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {results.checklists.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" />
                                        {t('common.checklists')} ({results.checklists.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.checklists.map(checklist => (
                                            <Link
                                                key={checklist.id}
                                                to={createPageUrl(`FillChecklist?id=${checklist.id}`)}
                                                onClick={handleClose}
                                                className="block p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                                            >
                                                <p className="font-medium text-slate-900">{checklist.title}</p>
                                                {checklist.description && (
                                                    <p className="text-sm text-slate-600 line-clamp-1 mt-1">{checklist.description}</p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {results.documents.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <FolderOpen className="w-4 h-4" />
                                        {t('common.documents')} ({results.documents.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.documents.map(doc => (
                                            <Link
                                                key={doc.id}
                                                to={createPageUrl(`ViewDocument?id=${doc.id}`)}
                                                onClick={handleClose}
                                                className="block p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                                            >
                                                <p className="font-medium text-slate-900">{doc.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-xs text-slate-500">{doc.file_name}</p>
                                                    {doc.tags && doc.tags.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {doc.tags.slice(0, 2).map(tag => (
                                                                <Badge key={tag} className="bg-blue-100 text-blue-700 text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {results.tasks.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <ListTodo className="w-4 h-4" />
                                        {t('common.tasks')} ({results.tasks.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {results.tasks.map(task => {
                                            const isForm = task.form_title;
                                            const title = isForm ? task.form_title : task.checklist_title;
                                            const url = isForm 
                                                ? `ViewFormSubmission?id=${task.id}`
                                                : `ViewChecklistSubmission?id=${task.id}`;
                                            
                                            return (
                                                <Link
                                                    key={task.id}
                                                    to={createPageUrl(url)}
                                                    onClick={handleClose}
                                                    className="block p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                                                >
                                                    <p className="font-medium text-slate-900">{title}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                        {task.assigned_to_email && (
                                                            <span>{task.assigned_to_email}</span>
                                                        )}
                                                        {task.due_date && (
                                                            <span>• {format(new Date(task.due_date), 'MMM d')}</span>
                                                        )}
                                                        {task.priority && (
                                                            <Badge className={`text-xs ${
                                                                task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                                task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {task.priority}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}