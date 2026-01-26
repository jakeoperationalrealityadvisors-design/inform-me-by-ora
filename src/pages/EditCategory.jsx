import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function EditCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('id');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [category, setCategory] = useState({
        name: '',
        description: '',
        color: '#6366f1'
    });
    
    const { data: existingCategory, isLoading } = useQuery({
        queryKey: ['edit-category', categoryId],
        queryFn: async () => {
            const categories = await httpClient.entities.Category.filter({ id: categoryId });
            return categories[0];
        },
        enabled: !!categoryId
    });
    
    useEffect(() => {
        if (existingCategory) {
            setCategory(existingCategory);
        }
    }, [existingCategory]);
    
    const saveMutation = useMutation({
        mutationFn: (data) => {
            if (categoryId) {
                return httpClient.entities.Category.update(categoryId, data);
            }
            return httpClient.entities.Category.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            navigate(createPageUrl('Admin'));
        }
    });
    
    const handleSave = () => {
        if (!category.name.trim()) return;
        saveMutation.mutate(category);
    };
    
    if (categoryId && isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Admin')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold text-white">
                            {categoryId ? 'Edit Category' : 'New Category'}
                        </h1>
                    </div>
                    <Button 
                        onClick={handleSave}
                        disabled={!category.name.trim() || saveMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {saveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Category
                    </Button>
                </div>
            </div>
            
            <div className="max-w-xl mx-auto px-4 py-6">
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-6 space-y-4">
                    <div>
                        <Label className="text-blue-100">Category Name *</Label>
                        <Input
                            value={category.name}
                            onChange={(e) => setCategory(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter category name"
                            className="mt-2 bg-[#0a0e17] border-blue-900/20 text-white"
                        />
                    </div>
                    
                    <div>
                        <Label className="text-blue-100">Description</Label>
                        <Textarea
                            value={category.description || ''}
                            onChange={(e) => setCategory(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter category description"
                            className="mt-2 bg-[#0a0e17] border-blue-900/20 text-white"
                        />
                    </div>
                    
                    <div>
                        <Label className="text-blue-100">Color</Label>
                        <div className="flex items-center gap-3 mt-2">
                            <input
                                type="color"
                                value={category.color || '#6366f1'}
                                onChange={(e) => setCategory(prev => ({ ...prev, color: e.target.value }))}
                                className="w-12 h-10 rounded cursor-pointer border border-blue-900/20 bg-[#0a0e17]"
                            />
                            <Input
                                value={category.color || '#6366f1'}
                                onChange={(e) => setCategory(prev => ({ ...prev, color: e.target.value }))}
                                placeholder="#6366f1"
                                className="flex-1 bg-[#0a0e17] border-blue-900/20 text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}