import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareAutomationDialog({ open, onOpenChange, automation }) {
    const queryClient = useQueryClient();
    const [makePublic, setMakePublic] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const shareUrl = `${window.location.origin}/automation/${automation?.id}`;
    
    const shareMutation = useMutation({
        mutationFn: async () => {
            // Create a template from this automation
            const templateData = {
                name: automation.name,
                description: automation.description,
                category: 'custom',
                trigger_type: automation.trigger_type,
                trigger_config: automation.trigger_config,
                condition_logic: automation.condition_logic,
                actions: automation.actions,
                is_system_template: false,
                usage_count: 0
            };
            
            return await httpClient.entities.AutomationTemplate.create(templateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['automation-templates']);
            toast.success('Automation shared as template');
            onOpenChange(false);
        }
    });
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-600" />
                        Share Automation
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div>
                        <Label>Share Link</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="flex-1"
                            />
                            <Button onClick={copyToClipboard} variant="outline" size="icon">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Save as Public Template</Label>
                            <p className="text-xs text-blue-400/70 mt-1">
                                Allow others to use this automation as a template
                            </p>
                        </div>
                        <Switch
                            checked={makePublic}
                            onCheckedChange={setMakePublic}
                        />
                    </div>
                    
                    {makePublic && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                            This will create a template in the library that other users can discover and use.
                        </div>
                    )}
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    {makePublic && (
                        <Button onClick={() => shareMutation.mutate()} disabled={shareMutation.isPending}>
                            Share as Template
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}