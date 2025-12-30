import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Loader2, FileText, CheckSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PDFExporter, { PDFTemplates } from './PDFExporter';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function BulkExportDialog({ submissions, type = 'form' }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const [template, setTemplate] = useState(PDFTemplates.STANDARD);
    const [isExporting, setIsExporting] = useState(false);

    // Fetch templates for forms/checklists
    const { data: formTemplates = [] } = useQuery({
        queryKey: ['form-templates'],
        queryFn: () => base44.entities.FormTemplate.list(),
        enabled: type === 'form' && open
    });

    const { data: checklistTemplates = [] } = useQuery({
        queryKey: ['checklist-templates'],
        queryFn: () => base44.entities.ChecklistTemplate.list(),
        enabled: type === 'checklist' && open
    });

    const toggleSelection = (id) => {
        setSelected(prev => 
            prev.includes(id) 
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selected.length === submissions.length) {
            setSelected([]);
        } else {
            setSelected(submissions.map(s => s.id));
        }
    };

    const handleBulkExport = async () => {
        if (selected.length === 0) {
            toast.error('Please select at least one submission');
            return;
        }

        setIsExporting(true);
        
        try {
            const selectedSubmissions = submissions.filter(s => selected.includes(s.id));
            const templates = type === 'form' ? formTemplates : checklistTemplates;
            
            for (const submission of selectedSubmissions) {
                const templateData = templates.find(t => 
                    t.id === (type === 'form' ? submission.form_template_id : submission.checklist_template_id)
                );
                
                const exporter = new PDFExporter();
                const title = type === 'form' ? submission.form_title : submission.checklist_title;
                const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const timestamp = new Date().getTime();
                
                if (type === 'form') {
                    exporter.generateFormPDF(submission, templateData, template);
                } else {
                    exporter.generateChecklistPDF(submission, templateData, template);
                }
                
                exporter.save(`${sanitizedTitle}_${timestamp}.pdf`);
                
                // Small delay to prevent browser blocking
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            toast.success(`Exported ${selected.length} PDF(s) successfully`);
            setOpen(false);
            setSelected([]);
        } catch (error) {
            console.error('Bulk export error:', error);
            toast.error('Failed to export PDFs');
        } finally {
            setIsExporting(false);
        }
    };

    const templateOptions = type === 'form' 
        ? [
            { label: 'Standard Report', value: PDFTemplates.STANDARD },
            { label: 'Incident Report', value: PDFTemplates.INCIDENT_REPORT },
            { label: 'Completion Certificate', value: PDFTemplates.COMPLETION_CERTIFICATE },
        ]
        : [
            { label: 'Standard Report', value: PDFTemplates.STANDARD },
            { label: 'Inspection Report', value: PDFTemplates.INSPECTION },
            { label: 'Completion Certificate', value: PDFTemplates.COMPLETION_CERTIFICATE },
        ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-800 text-blue-300 hover:bg-blue-950/50"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Bulk Export
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1419] border-blue-900/20 max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white">Bulk Export to PDF</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div>
                        <Label className="text-blue-100">Select Template</Label>
                        <Select value={template} onValueChange={setTemplate}>
                            <SelectTrigger className="mt-2 bg-[#0a0e17] border-blue-900/20 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {templateOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label className="text-blue-100">
                                Select Submissions ({selected.length} of {submissions.length})
                            </Label>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={toggleAll}
                                className="text-blue-400 hover:bg-blue-950/50"
                            >
                                {selected.length === submissions.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto border border-blue-900/20 rounded-lg p-3 bg-[#0a0e17]">
                            {submissions.map(submission => (
                                <div 
                                    key={submission.id}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-950/30 transition-colors cursor-pointer"
                                    onClick={() => toggleSelection(submission.id)}
                                >
                                    <Checkbox
                                        checked={selected.includes(submission.id)}
                                        onCheckedChange={() => toggleSelection(submission.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {type === 'form' ? (
                                                <FileText className="w-4 h-4 text-blue-400" />
                                            ) : (
                                                <CheckSquare className="w-4 h-4 text-blue-400" />
                                            )}
                                            <p className="font-medium text-white">
                                                {type === 'form' ? submission.form_title : submission.checklist_title}
                                            </p>
                                        </div>
                                        <p className="text-sm text-blue-400/70 mt-1">
                                            {submission.submitted_by_name || 'Unknown'} • {
                                                new Date(submission.created_date).toLocaleDateString()
                                            }
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setOpen(false)}
                            className="border-blue-800 text-blue-300 hover:bg-blue-950/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkExport}
                            disabled={selected.length === 0 || isExporting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isExporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export {selected.length} PDF{selected.length !== 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}