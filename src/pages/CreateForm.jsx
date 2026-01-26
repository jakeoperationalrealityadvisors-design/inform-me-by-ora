import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '@/api/httpClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Upload, Camera, FileText, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { useLanguage } from '@/components/language/LanguageContext';
import RoleGuard from '@/components/auth/RoleGuard';
import { logActivity } from '@/components/activity/ActivityLogger';

function CreateFormContent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        status: 'active'
    });
    
    const [fields, setFields] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [cameraPermission, setCameraPermission] = useState('prompt');

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => httpClient.entities.Category.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => httpClient.entities.FormTemplate.create(data),
        onSuccess: async (newForm) => {
            await logActivity({
                action_type: 'form_created',
                entity_type: 'form',
                entity_id: newForm.id,
                entity_title: newForm.title,
                description: `Created form template: ${newForm.title}`
            });
            queryClient.invalidateQueries({ queryKey: ['forms'] });
            toast.success('Form template created successfully');
            navigate(createPageUrl('Home'));
        },
        onError: (error) => {
            toast.error('Failed to create form template');
            console.error(error);
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
        setFields([...fields, newField]);
    };

    const removeField = (index) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index, key, value) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };
        setFields(updated);
    };

    const handleUpload = async (file) => {
        if (!file) return;

        setIsUploading(true);
        try {
            // Upload file first
            const { file_url } = await httpClient.integrations.Core.UploadFile({ file });
            
            setIsExtracting(true);
            
            // Use AI to extract form structure
            const response = await httpClient.integrations.Core.InvokeLLM({
                prompt: `Analyze this document and extract a form structure. Identify all fields that would make sense for a form template. For each field, provide:
- label (the field name)
- type (text, textarea, number, date, select, checkbox)
- required (boolean)
- options (array of strings, only for select type)
- placeholder (helpful text)

Return JSON with: { title, description, fields: [...] }`,
                file_urls: [file_url],
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        fields: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    label: { type: "string" },
                                    type: { type: "string" },
                                    required: { type: "boolean" },
                                    options: { type: "array", items: { type: "string" } },
                                    placeholder: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });

            if (response.title) setFormData(prev => ({ ...prev, title: response.title }));
            if (response.description) setFormData(prev => ({ ...prev, description: response.description }));
            if (response.fields) {
                const fieldsWithIds = response.fields.map((field, idx) => ({
                    ...field,
                    id: `field_${Date.now()}_${idx}`,
                    options: field.options || []
                }));
                setFields(fieldsWithIds);
            }

            toast.success('Form extracted from document');
        } catch (error) {
            toast.error('Failed to process document');
            console.error(error);
        } finally {
            setIsUploading(false);
            setIsExtracting(false);
        }
    };

    const checkCameraPermission = async () => {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            setCameraPermission(result.state);
            result.addEventListener('change', () => {
                setCameraPermission(result.state);
            });
        } catch (error) {
            console.log('Permission API not supported');
        }
    };

    React.useEffect(() => {
        checkCameraPermission();
    }, []);

    const handleCameraCapture = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleUpload(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || fields.length === 0) {
            toast.error('Please add a title and at least one field');
            return;
        }

        await createMutation.mutateAsync({
            ...formData,
            fields
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#0a0e17] pb-20 md:pb-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#0a0e17] border-b border-slate-200 dark:border-blue-900/30 sticky top-0 z-20 shadow-sm">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(createPageUrl('Home'))}
                            className="text-slate-700 dark:text-[#FF8C00] shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#FF8C00] truncate">
                                Create Form
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#FF8C00]/70 hidden sm:block">
                                Build from scratch or upload
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
                {/* AI Form Builder - Collapsible */}
                <Collapsible>
                    <Card className="bg-white dark:bg-[#0a0e17] border-slate-200 dark:border-blue-900/30">
                        <CollapsibleTrigger className="w-full">
                            <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0f1419] transition-colors">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-[#FF8C00] flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                        AI Upload
                                    </CardTitle>
                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="space-y-3 pt-0">
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#FF8C00]/70">
                                    Upload or scan to auto-extract form structure
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading || isExtracting}
                                        className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black w-full sm:w-auto"
                                    >
                                        {isUploading || isExtracting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {isExtracting ? 'Extracting...' : 'Uploading...'}
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => cameraInputRef.current?.click()}
                                        disabled={isUploading || isExtracting}
                                        variant="outline"
                                        className="border-blue-900/30 dark:text-[#FF8C00] w-full sm:w-auto"
                                    >
                                        <Camera className="w-4 h-4 mr-2" />
                                        Scan
                                    </Button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => handleUpload(e.target.files[0])}
                                />
                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleCameraCapture}
                                />
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>

                {/* Form Builder */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="bg-white dark:bg-[#0a0e17] border-slate-200 dark:border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-[#FF8C00]">Form Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-slate-700 dark:text-[#FF8C00]">Title *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter form title"
                                    required
                                    className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-700 dark:text-[#FF8C00]">Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter form description"
                                    className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-700 dark:text-[#FF8C00]">Category</Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                >
                                    <SelectTrigger className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fields */}
                    <Card className="bg-white dark:bg-[#0a0e17] border-slate-200 dark:border-blue-900/30">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-[#FF8C00]">Fields ({fields.length})</CardTitle>
                            <Button
                                type="button"
                                onClick={addField}
                                size="sm"
                                className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black h-8 sm:h-9 text-xs sm:text-sm"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Add
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {fields.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-[#FF8C00]/50">
                                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs sm:text-sm">No fields yet</p>
                                </div>
                            ) : (
                                fields.map((field, index) => (
                                    <Collapsible key={field.id} defaultOpen={index === fields.length - 1}>
                                        <div className="border border-slate-200 dark:border-blue-900/30 rounded-lg">
                                            <CollapsibleTrigger className="w-full p-3 hover:bg-slate-50 dark:hover:bg-[#0f1419] transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 flex-1 text-left">
                                                        <ChevronDown className="w-4 h-4 text-slate-500" />
                                                        <span className="text-sm font-medium text-slate-900 dark:text-[#FF8C00] truncate">
                                                            {field.label || 'New Field'}
                                                        </span>
                                                        <Badge variant="outline" className="text-xs">{field.type}</Badge>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeField(index);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="p-3 border-t border-slate-200 dark:border-blue-900/30 space-y-3">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                        <div>
                                                            <Label className="text-xs text-slate-700 dark:text-[#FF8C00]">Label</Label>
                                                            <Input
                                                                value={field.label}
                                                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                                                placeholder="Field label"
                                                                className="mt-1 h-9 text-sm border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-slate-700 dark:text-[#FF8C00]">Type</Label>
                                                            <Select
                                                                value={field.type}
                                                                onValueChange={(value) => updateField(index, 'type', value)}
                                                            >
                                                                <SelectTrigger className="mt-1 h-9 text-sm border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="text">Text</SelectItem>
                                                                    <SelectItem value="textarea">Text Area</SelectItem>
                                                                    <SelectItem value="number">Number</SelectItem>
                                                                    <SelectItem value="date">Date</SelectItem>
                                                                    <SelectItem value="select">Select</SelectItem>
                                                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                                                    <SelectItem value="photo">Photo</SelectItem>
                                                                    <SelectItem value="signature">Signature</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.required}
                                                            onChange={(e) => updateField(index, 'required', e.target.checked)}
                                                            className="rounded h-4 w-4"
                                                        />
                                                        <Label className="text-xs sm:text-sm text-slate-700 dark:text-[#FF8C00]">Required</Label>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(createPageUrl('Home'))}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black"
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Form Template'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CreateForm() {
    return (
        <RoleGuard requiredPermission="can_create_forms">
            <CreateFormContent />
        </RoleGuard>
    );
}