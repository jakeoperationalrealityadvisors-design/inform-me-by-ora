import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, FileText, CheckSquare, Folder, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { motion } from 'framer-motion';
import RoleGuard from '@/components/auth/RoleGuard';

export default function Admin() {
    return (
        <RoleGuard allowedRoles={['admin', 'manager']}>
            <AdminContent />
        </RoleGuard>
    );
}

function AdminContent() {
    const queryClient = useQueryClient();
    const [deleteItem, setDeleteItem] = useState(null);
    
    const { data: forms = [], isLoading: formsLoading } = useQuery({
        queryKey: ['all-forms'],
        queryFn: () => base44.entities.FormTemplate.list('-created_date')
    });
    
    const { data: checklists = [], isLoading: checklistsLoading } = useQuery({
        queryKey: ['all-checklists'],
        queryFn: () => base44.entities.ChecklistTemplate.list('-created_date')
    });
    
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });
    
    const deleteFormMutation = useMutation({
        mutationFn: (id) => base44.entities.FormTemplate.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['all-forms', 'forms']);
            setDeleteItem(null);
        }
    });
    
    const deleteChecklistMutation = useMutation({
        mutationFn: (id) => base44.entities.ChecklistTemplate.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['all-checklists', 'checklists']);
            setDeleteItem(null);
        }
    });
    
    const deleteCategoryMutation = useMutation({
        mutationFn: (id) => base44.entities.Category.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            setDeleteItem(null);
        }
    });
    
    const handleDelete = () => {
        if (!deleteItem) return;
        
        if (deleteItem.type === 'form') {
            deleteFormMutation.mutate(deleteItem.id);
        } else if (deleteItem.type === 'checklist') {
            deleteChecklistMutation.mutate(deleteItem.id);
        } else if (deleteItem.type === 'category') {
            deleteCategoryMutation.mutate(deleteItem.id);
        }
    };
    
    const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '—';
    
    const statusColors = {
        draft: 'bg-slate-100 text-slate-600',
        active: 'bg-emerald-100 text-emerald-700',
        archived: 'bg-amber-100 text-amber-700'
    };
    
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to={createPageUrl('Home')}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
                        <p className="text-sm text-slate-500">Manage forms, checklists & categories</p>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto px-4 py-6">
                <Tabs defaultValue="forms">
                    <TabsList className="w-full grid grid-cols-3 mb-6">
                        <TabsTrigger value="forms" className="gap-2">
                            <FileText className="w-4 h-4" />
                            Forms ({forms.length})
                        </TabsTrigger>
                        <TabsTrigger value="checklists" className="gap-2">
                            <CheckSquare className="w-4 h-4" />
                            Checklists ({checklists.length})
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="gap-2">
                            <Folder className="w-4 h-4" />
                            Categories ({categories.length})
                        </TabsTrigger>
                    </TabsList>
                    
                    {/* Forms Tab */}
                    <TabsContent value="forms">
                        <div className="flex justify-end mb-4">
                            <Link to={createPageUrl('EditForm')}>
                                <Button className="bg-slate-900 hover:bg-slate-800">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Form
                                </Button>
                            </Link>
                        </div>
                        
                        {formsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        ) : forms.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                {forms.map((form, idx) => (
                                    <motion.div
                                        key={form.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-medium text-slate-900">{form.title}</h3>
                                            <div className="flex gap-3 mt-1 text-sm text-slate-500">
                                                <span>{form.fields?.length || 0} fields</span>
                                                <span>{getCategoryName(form.category_id)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={statusColors[form.status || 'active']}>
                                                {form.status || 'active'}
                                            </Badge>
                                            <Link to={createPageUrl(`EditForm?id=${form.id}`)}>
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => setDeleteItem({ type: 'form', id: form.id, title: form.title })}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                No forms created yet
                            </div>
                        )}
                    </TabsContent>
                    
                    {/* Checklists Tab */}
                    <TabsContent value="checklists">
                        <div className="flex justify-end mb-4">
                            <Link to={createPageUrl('EditChecklist')}>
                                <Button className="bg-slate-900 hover:bg-slate-800">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Checklist
                                </Button>
                            </Link>
                        </div>
                        
                        {checklistsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        ) : checklists.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                {checklists.map((checklist, idx) => (
                                    <motion.div
                                        key={checklist.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-medium text-slate-900">{checklist.title}</h3>
                                            <div className="flex gap-3 mt-1 text-sm text-slate-500">
                                                <span>{checklist.items?.length || 0} items</span>
                                                <span>{getCategoryName(checklist.category_id)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={statusColors[checklist.status || 'active']}>
                                                {checklist.status || 'active'}
                                            </Badge>
                                            <Link to={createPageUrl(`EditChecklist?id=${checklist.id}`)}>
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => setDeleteItem({ type: 'checklist', id: checklist.id, title: checklist.title })}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                No checklists created yet
                            </div>
                        )}
                    </TabsContent>
                    
                    {/* Categories Tab */}
                    <TabsContent value="categories">
                        <div className="flex justify-end mb-4">
                            <Link to={createPageUrl('EditCategory')}>
                                <Button className="bg-slate-900 hover:bg-slate-800">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Category
                                </Button>
                            </Link>
                        </div>
                        
                        {categoriesLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            </div>
                        ) : categories.length > 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                {categories.map((category, idx) => (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-medium text-slate-900">{category.name}</h3>
                                            {category.description && (
                                                <p className="text-sm text-slate-500 mt-1">{category.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link to={createPageUrl(`EditCategory?id=${category.id}`)}>
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => setDeleteItem({ type: 'category', id: category.id, title: category.name })}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                No categories created yet
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            
            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {deleteItem?.type}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteItem?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}