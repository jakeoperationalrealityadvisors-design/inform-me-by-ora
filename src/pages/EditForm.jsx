import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Loader2, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { SuggestFieldsButton, AutoCategorizeButton, GenerateExamplesButton } from '@/components/ai/AIFormHelper';
import ExampleSubmissionsDialog from '@/components/ai/ExampleSubmissionsDialog';
import { toast } from 'sonner';

const FIELD_TYPES = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Yes/No Checkbox' },
    { value: 'photo', label: 'Photo Upload' },
    { value: 'signature', label: 'Signature' }
];

export default function EditForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [form, setForm] = useState({
        title: '',
        description: '',
        category_id: '',
        status: 'active',
        fields: []
    });
    
    const [exampleSubmissions, setExampleSubmissions] = useState([]);
    const [showExamples, setShowExamples] = useState(false);
    
    const { data: existingForm, isLoading } = useQuery({
        queryKey: ['edit-form', formId],
        queryFn: async () => {
            const forms = await base44.entities.FormTemplate.filter({ id: formId });
            return forms[0];
        },
        enabled: !!formId
    });
    
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => base44.entities.Category.list()
    });
    
    useEffect(() => {
        if (existingForm) {
            setForm(existingForm);
        }
    }, [existingForm]);
    
    const saveMutation = useMutation({
        mutationFn: (data) => {
            if (formId) {
                return base44.entities.FormTemplate.update(formId, data);
            }
            return base44.entities.FormTemplate.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['forms', 'all-forms']);
            navigate(createPageUrl('Admin'));
        }
    });
    
    const addField = () => {
        const newField = {
            id: `field_${Date.now()}`,
            label: '',
            type: 'text',
            required: false,
            options: [],
            placeholder: ''
        };
        setForm(prev => ({ ...prev, fields: [...prev.fields, newField] }));
    };
    
    const updateField = (index, updates) => {
        setForm(prev => ({
            ...prev,
            fields: prev.fields.map((f, i) => i === index ? { ...f, ...updates } : f)
        }));
    };
    
    const removeField = (index) => {
        setForm(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };
    
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const newFields = Array.from(form.fields);
        const [removed] = newFields.splice(result.source.index, 1);
        newFields.splice(result.destination.index, 0, removed);
        
        setForm(prev => ({ ...prev, fields: newFields }));
    };
    
    const handleSave = () => {
        if (!form.title.trim()) return;
        saveMutation.mutate(form);
    };
    
    const handleFieldsSuggested = (fields) => {
        setForm(prev => ({ ...prev, fields: [...prev.fields, ...fields] }));
    };
    
    const handleCategorySelected = (categoryId) => {
        setForm(prev => ({ ...prev, category_id: categoryId }));
    };
    
    const handleExamplesGenerated = (submissions) => {
        setExampleSubmissions(submissions);
        setShowExamples(true);
    };
    
    if (formId && isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Admin')}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-lg font-semibold text-slate-900">
                            {formId ? 'Edit Form' : 'New Form'}
                        </h1>
                    </div>
                    <Button 
                        onClick={handleSave}
                        disabled={!form.title.trim() || saveMutation.isPending}
                        className="bg-slate-900 hover:bg-slate-800"
                    >
                        {saveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Form
                    </Button>
                </div>
            </div>
            
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
                    
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label>Form Title *</Label>
                            <div className="flex gap-2">
                                <SuggestFieldsButton 
                                    formTitle={form.title}
                                    onFieldsSuggested={handleFieldsSuggested}
                                />
                                <GenerateExamplesButton
                                    form={form}
                                    onExamplesGenerated={handleExamplesGenerated}
                                />
                            </div>
                        </div>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter form title"
                        />
                    </div>
                    
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={form.description || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter form description"
                            className="mt-2"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Category</Label>
                                <AutoCategorizeButton
                                    formTitle={form.title}
                                    formDescription={form.description}
                                    categories={categories}
                                    onCategorySelected={handleCategorySelected}
                                />
                            </div>
                            <Select
                                value={form.category_id || ''}
                                onValueChange={(value) => setForm(prev => ({ ...prev, category_id: value }))}
                            >
                                <SelectTrigger>
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
                            <Label>Status</Label>
                            <Select
                                value={form.status || 'active'}
                                onValueChange={(value) => setForm(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                
                {/* Fields */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Form Fields</h2>
                        <Button onClick={addField} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Field
                        </Button>
                    </div>
                    
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="fields">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                    <AnimatePresence>
                                        {form.fields.map((field, index) => (
                                            <Draggable key={field.id} draggableId={field.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <motion.div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className={`border border-slate-200 rounded-xl p-4 bg-white ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div {...provided.dragHandleProps} className="mt-2 cursor-grab">
                                                                <GripVertical className="w-5 h-5 text-slate-300" />
                                                            </div>
                                                            
                                                            <div className="flex-1 space-y-3">
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <Input
                                                                        value={field.label}
                                                                        onChange={(e) => updateField(index, { label: e.target.value })}
                                                                        placeholder="Field label"
                                                                    />
                                                                    <Select
                                                                        value={field.type}
                                                                        onValueChange={(value) => updateField(index, { type: value })}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {FIELD_TYPES.map(t => (
                                                                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                
                                                                {field.type === 'select' && (
                                                                    <Input
                                                                        value={field.options?.join(', ') || ''}
                                                                        onChange={(e) => updateField(index, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                                                        placeholder="Options (comma separated)"
                                                                    />
                                                                )}
                                                                
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <Switch
                                                                            checked={field.required || false}
                                                                            onCheckedChange={(checked) => updateField(index, { required: checked })}
                                                                        />
                                                                        <Label className="text-sm">Required</Label>
                                                                    </div>
                                                                    <Input
                                                                        value={field.placeholder || ''}
                                                                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                                                        placeholder="Placeholder text"
                                                                        className="flex-1"
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeField(index)}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-500" />
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
                    
                    {form.fields.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            No fields added yet. Click "Add Field" to start building your form.
                        </div>
                    )}
                </div>
            </div>
            
            <ExampleSubmissionsDialog
                open={showExamples}
                onOpenChange={setShowExamples}
                submissions={exampleSubmissions}
            />
        </div>
    );
}