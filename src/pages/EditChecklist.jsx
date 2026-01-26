import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Loader2, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function EditChecklist() {
    const urlParams = new URLSearchParams(window.location.search);
    const checklistId = urlParams.get('id');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [checklist, setChecklist] = useState({
        title: '',
        description: '',
        category_id: '',
        status: 'active',
        items: []
    });
    
    const { data: existingChecklist, isLoading } = useQuery({
        queryKey: ['edit-checklist', checklistId],
        queryFn: async () => {
            const checklists = await httpClient.entities.ChecklistTemplate.filter({ id: checklistId });
            return checklists[0];
        },
        enabled: !!checklistId
    });
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => httpClient.entities.Category.list()
    });
    
    useEffect(() => {
        if (existingChecklist) {
            setChecklist(existingChecklist);
        }
    }, [existingChecklist]);
    
    const saveMutation = useMutation({
        mutationFn: (data) => {
            if (checklistId) {
                return httpClient.entities.ChecklistTemplate.update(checklistId, data);
            }
            return httpClient.entities.ChecklistTemplate.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['checklists', 'all-checklists']);
            navigate(createPageUrl('Admin'));
        }
    });
    
    const addItem = () => {
        const newItem = {
            id: `item_${Date.now()}`,
            text: '',
            required: false,
            notes_enabled: false
        };
        setChecklist(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };
    
    const updateItem = (index, updates) => {
        setChecklist(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === index ? { ...item, ...updates } : item)
        }));
    };
    
    const removeItem = (index) => {
        setChecklist(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };
    
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const newItems = Array.from(checklist.items);
        const [removed] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, removed);
        
        setChecklist(prev => ({ ...prev, items: newItems }));
    };
    
    const handleSave = () => {
        if (!checklist.title.trim()) return;
        saveMutation.mutate(checklist);
    };
    
    if (checklistId && isLoading) {
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
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Admin')}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-950/50 text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold text-white">
                            {checklistId ? 'Edit Checklist' : 'New Checklist'}
                        </h1>
                    </div>
                    <Button 
                        onClick={handleSave}
                        disabled={!checklist.title.trim() || saveMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {saveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Checklist
                    </Button>
                </div>
            </div>
            
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-white">Basic Information</h2>
                    
                    <div>
                        <Label className="text-blue-100">Checklist Title *</Label>
                        <Input
                            value={checklist.title}
                            onChange={(e) => setChecklist(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter checklist title"
                            className="mt-2 bg-[#0a0e17] border-blue-900/20 text-white"
                        />
                    </div>
                    
                    <div>
                        <Label className="text-blue-100">Description</Label>
                        <Textarea
                            value={checklist.description || ''}
                            onChange={(e) => setChecklist(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter checklist description"
                            className="mt-2 bg-[#0a0e17] border-blue-900/20 text-white"
                        />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label className="text-blue-100">Category</Label>
                            <Select
                                value={checklist.category_id || ''}
                                onValueChange={(value) => setChecklist(prev => ({ ...prev, category_id: value }))}
                            >
                                <SelectTrigger className="mt-2 bg-[#0a0e17] border-blue-900/20 text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label className="text-blue-100">Status</Label>
                            <Select
                                value={checklist.status || 'active'}
                                onValueChange={(value) => setChecklist(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger className="mt-2 bg-[#0a0e17] border-blue-900/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label className="text-blue-100">Recurrence</Label>
                            <Select
                                value={checklist.recurrence || 'none'}
                                onValueChange={(value) => setChecklist(prev => ({ ...prev, recurrence: value }))}
                            >
                                <SelectTrigger className="mt-2 bg-[#0a0e17] border-blue-900/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                {/* Items */}
                <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Checklist Items</h2>
                        <Button onClick={addItem} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                    
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="items">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    <AnimatePresence>
                                        {checklist.items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <motion.div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className={`border border-blue-900/20 rounded-xl p-4 bg-[#0a0e17] ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div {...provided.dragHandleProps} className="mt-2 cursor-grab">
                                                                <GripVertical className="w-5 h-5 text-blue-400/50" />
                                                            </div>
                                                            
                                                            <div className="flex-1 space-y-3">
                                                                <Input
                                                                    value={item.text}
                                                                    onChange={(e) => updateItem(index, { text: e.target.value })}
                                                                    placeholder="Checklist item text"
                                                                    className="bg-[#0f1419] border-blue-900/20 text-white"
                                                                />
                                                                
                                                                <div className="flex items-center gap-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <Switch
                                                                            checked={item.required || false}
                                                                            onCheckedChange={(checked) => updateItem(index, { required: checked })}
                                                                        />
                                                                        <Label className="text-sm text-blue-100">Required</Label>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Switch
                                                                            checked={item.notes_enabled || false}
                                                                            onCheckedChange={(checked) => updateItem(index, { notes_enabled: checked })}
                                                                        />
                                                                        <Label className="text-sm flex items-center gap-1 text-blue-100">
                                                                            <MessageSquare className="w-4 h-4" />
                                                                            Allow Notes
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeItem(index)}
                                                                className="hover:bg-blue-950/50"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </Draggable>
                                        ))}
                                    </AnimatePresence>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    
                    {checklist.items.length === 0 && (
                        <div className="text-center py-8 text-blue-400/60">
                            No items added yet. Click "Add Item" to start building your checklist.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}