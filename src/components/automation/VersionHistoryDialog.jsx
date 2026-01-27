import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, GitCompare, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function VersionHistoryDialog({ open, onOpenChange, ruleId, onRevert }) {
    const queryClient = useQueryClient();
    const [selectedVersions, setSelectedVersions] = useState([]);
    
    const { data: versions = [], isLoading } = useQuery({
        queryKey: ['automation-versions', ruleId],
        queryFn: () => httpClient.entities.AutomationRuleVersion.filter({ rule_id: ruleId }, '-version_number'),
        enabled: !!ruleId && open
    });
    
    const revertMutation = useMutation({
        mutationFn: async (versionId) => {
            const version = versions.find(v => v.id === versionId);
            
            // Update the main rule with version data
            await httpClient.entities.AutomationRule.update(ruleId, {
                name: version.name,
                description: version.description,
                trigger_type: version.trigger_type,
                trigger_config: version.trigger_config,
                condition_logic: version.condition_logic,
                actions: version.actions
            });
            
            // Mark this version as active
            await httpClient.entities.AutomationRuleVersion.update(versionId, { is_active: true });
            
            // Mark all other versions as inactive
            const otherVersions = versions.filter(v => v.id !== versionId);
            for (const v of otherVersions) {
                await httpClient.entities.AutomationRuleVersion.update(v.id, { is_active: false });
            }
            
            return version;
        },
        onSuccess: (version) => {
            queryClient.invalidateQueries(['automation-rules']);
            queryClient.invalidateQueries(['automation-versions']);
            toast.success(`Reverted to version ${version.version_number}`);
            onRevert?.();
            onOpenChange(false);
        }
    });
    
    const handleCompare = () => {
        if (selectedVersions.length !== 2) {
            toast.error('Please select exactly 2 versions to compare');
            return;
        }
        // Open comparison dialog
        window.location.hash = `compare-${selectedVersions[0]}-${selectedVersions[1]}`;
    };
    
    const toggleVersion = (versionId) => {
        if (selectedVersions.includes(versionId)) {
            setSelectedVersions(selectedVersions.filter(id => id !== versionId));
        } else if (selectedVersions.length < 2) {
            setSelectedVersions([...selectedVersions, versionId]);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-600" />
                        Version History
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {selectedVersions.length === 2 && (
                        <Button onClick={handleCompare} className="w-full" variant="outline">
                            <GitCompare className="w-4 h-4 mr-2" />
                            Compare Selected Versions
                        </Button>
                    )}
                    
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                            {versions.map((version) => (
                                <div
                                    key={version.id}
                                    className={`border rounded-lg p-4 transition-all ${
                                        selectedVersions.includes(version.id) 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-blue-900/20 hover:border-blue-900/30'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedVersions.includes(version.id)}
                                                onChange={() => toggleVersion(version.id)}
                                                className="rounded"
                                                disabled={selectedVersions.length >= 2 && !selectedVersions.includes(version.id)}
                                            />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-mono">
                                                        v{version.version_number}
                                                    </Badge>
                                                    {version.is_active && (
                                                        <Badge className="bg-green-600">
                                                            <Check className="w-3 h-3 mr-1" />
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-sm mt-1">{version.name}</h4>
                                            </div>
                                        </div>
                                        
                                        {!version.is_active && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => revertMutation.mutate(version.id)}
                                                disabled={revertMutation.isPending}
                                            >
                                                <RotateCcw className="w-3 h-3 mr-1" />
                                                Revert
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div className="text-xs text-blue-300 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(version.created_date), 'PPp')}
                                        </div>
                                        <div>Created by: {version.created_by}</div>
                                        {version.change_notes && (
                                            <p className="text-blue-200 mt-2 bg-[#0a0e17] p-2 rounded">
                                                {version.change_notes}
                                            </p>
                                        )}
                                        <div className="mt-2">
                                            <span className="font-medium">Trigger:</span> {version.trigger_type.replace(/_/g, ' ')}
                                            {' • '}
                                            <span className="font-medium">Actions:</span> {version.actions.length}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {versions.length === 0 && !isLoading && (
                                <div className="text-center py-8 text-blue-400/70">
                                    No version history yet
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}