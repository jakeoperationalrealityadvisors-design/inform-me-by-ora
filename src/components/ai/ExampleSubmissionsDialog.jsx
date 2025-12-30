import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, FileText } from 'lucide-react';

export default function ExampleSubmissionsDialog({ open, onOpenChange, submissions }) {
    if (!submissions || submissions.length === 0) return null;
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Generated Example Submissions</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-4 pr-4">
                        {submissions.map((sub, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Example {idx + 1}</h3>
                                    <Badge>{sub.status}</Badge>
                                </div>
                                
                                <div className="flex gap-4 text-sm text-slate-600">
                                    {sub.submitted_by_name && (
                                        <span className="flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            {sub.submitted_by_name}
                                        </span>
                                    )}
                                    {sub.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {sub.location}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="border-t pt-3">
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Responses
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(sub.responses || {}).map(([key, value]) => (
                                            <div key={key} className="text-sm">
                                                <span className="text-slate-500">{key}:</span>
                                                <span className="ml-2 font-medium">
                                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}