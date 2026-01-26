import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookTemplate, Star, Zap, Bell, FileCheck, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const categoryIcons = {
    task_management: Zap,
    notifications: Bell,
    approval_workflow: FileCheck,
    form_handling: FileCheck,
    custom: Star
};

const TemplateCard = ({ template, onSelect }) => {
    const Icon = categoryIcons[template.category] || Star;
    
    return (
        <Card 
            className="p-4 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md"
            onClick={() => onSelect(template)}
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                        {template.is_system_template && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Official
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{template.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                            {template.trigger_type.replace(/_/g, ' ')}
                        </Badge>
                        <span>•</span>
                        <span>{template.actions?.length || 0} actions</span>
                        {template.usage_count > 0 && (
                            <>
                                <span>•</span>
                                <span>Used {template.usage_count}×</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default function AutomationTemplateLibrary({ open, onOpenChange, onSelectTemplate }) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    const { data: templates = [], isLoading } = useQuery({
        queryKey: ['automation-templates'],
        queryFn: () => httpClient.entities.AutomationTemplate.list('-usage_count')
    });
    
    const incrementUsage = useMutation({
        mutationFn: (templateId) => {
            const template = templates.find(t => t.id === templateId);
            return httpClient.entities.AutomationTemplate.update(templateId, {
                usage_count: (template?.usage_count || 0) + 1
            });
        }
    });
    
    const handleSelectTemplate = (template) => {
        // Increment usage count
        incrementUsage.mutate(template.id);
        
        // Pass template data to parent
        onSelectTemplate({
            name: template.name,
            description: template.description,
            trigger_type: template.trigger_type,
            trigger_config: template.trigger_config || {},
            condition_logic: template.condition_logic || { operator: 'AND', groups: [] },
            actions: template.actions || []
        });
        
        toast.success(`Template "${template.name}" applied`);
        onOpenChange(false);
    };
    
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !search || 
            template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    const systemTemplates = filteredTemplates.filter(t => t.is_system_template);
    const customTemplates = filteredTemplates.filter(t => !t.is_system_template);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookTemplate className="w-5 h-5 text-blue-600" />
                        Automation Template Library
                    </DialogTitle>
                    <DialogDescription>
                        Start with a pre-built template or use one of your saved automations
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search templates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    
                    {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {['all', 'task_management', 'notifications', 'approval_workflow', 'form_handling', 'custom'].map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat.replace(/_/g, ' ')}
                            </Button>
                        ))}
                    </div>
                    
                    {/* Templates */}
                    <Tabs defaultValue="system" className="flex-1 overflow-hidden flex flex-col">
                        <TabsList>
                            <TabsTrigger value="system">
                                Official Templates ({systemTemplates.length})
                            </TabsTrigger>
                            <TabsTrigger value="custom">
                                My Templates ({customTemplates.length})
                            </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="system" className="flex-1 overflow-y-auto mt-4">
                            <div className="grid grid-cols-2 gap-3 pr-2">
                                {systemTemplates.map(template => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        onSelect={handleSelectTemplate}
                                    />
                                ))}
                                {systemTemplates.length === 0 && (
                                    <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                                        No system templates found
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="custom" className="flex-1 overflow-y-auto mt-4">
                            <div className="grid grid-cols-2 gap-3 pr-2">
                                {customTemplates.map(template => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        onSelect={handleSelectTemplate}
                                    />
                                ))}
                                {customTemplates.length === 0 && (
                                    <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                                        No custom templates yet. Save an automation as a template to see it here.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}