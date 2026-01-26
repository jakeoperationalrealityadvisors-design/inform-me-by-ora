import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookTemplate, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SaveAsTemplateDialog({ open, onOpenChange, automation }) {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('custom');
    
    const saveMutation = useMutation({
        mutationFn: (templateData) => httpClient.entities.AutomationTemplate.create(templateData),
        onSuccess: () => {
            queryClient.invalidateQueries(['automation-templates']);
            toast.success('Template saved successfully');
            onOpenChange(false);
            setName('');
            setDescription('');
            setCategory('custom');
        },
        onError: (error) => {
            toast.error('Failed to save template: ' + error.message);
        }
    });
    
    const handleSave = () => {
        if (!name.trim()) {
            toast.error('Please enter a template name');
            return;
        }
        
        saveMutation.mutate({
            name: name.trim(),
            description: description.trim(),
            category,
            trigger_type: automation.trigger_type,
            trigger_config: automation.trigger_config,
            condition_logic: automation.condition_logic,
            actions: automation.actions,
            is_system_template: false,
            usage_count: 0
        });
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookTemplate className="w-5 h-5 text-blue-600" />
                        Save as Template
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Template Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., High Priority Task Notification"
                        />
                    </div>
                    
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this automation template does..."
                            rows={3}
                        />
                    </div>
                    
                    <div>
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="task_management">Task Management</SelectItem>
                                <SelectItem value="notifications">Notifications</SelectItem>
                                <SelectItem value="approval_workflow">Approval Workflow</SelectItem>
                                <SelectItem value="form_handling">Form Handling</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Template'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}