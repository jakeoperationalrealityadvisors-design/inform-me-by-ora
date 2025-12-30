import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import PDFExporter, { PDFTemplates } from './PDFExporter';
import { toast } from 'sonner';

export default function ExportButton({ 
    submission, 
    template, 
    type = 'form',
    size = 'default',
    variant = 'outline'
}) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (pdfTemplate) => {
        setIsExporting(true);
        
        try {
            const exporter = new PDFExporter();
            const timestamp = new Date().getTime();
            const title = type === 'form' ? submission.form_title : submission.checklist_title;
            const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            
            let doc;
            if (type === 'form') {
                doc = exporter.generateFormPDF(submission, template, pdfTemplate);
            } else {
                doc = exporter.generateChecklistPDF(submission, template, pdfTemplate);
            }
            
            const templateSuffix = pdfTemplate === PDFTemplates.STANDARD ? '' : `_${pdfTemplate}`;
            exporter.save(`${sanitizedTitle}_${timestamp}${templateSuffix}.pdf`);
            
            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    const templates = type === 'form' 
        ? [
            { label: 'Standard Report', value: PDFTemplates.STANDARD, icon: FileText },
            { label: 'Incident Report', value: PDFTemplates.INCIDENT_REPORT, icon: FileText },
            { label: 'Completion Certificate', value: PDFTemplates.COMPLETION_CERTIFICATE, icon: FileText },
        ]
        : [
            { label: 'Standard Report', value: PDFTemplates.STANDARD, icon: FileText },
            { label: 'Inspection Report', value: PDFTemplates.INSPECTION, icon: FileText },
            { label: 'Completion Certificate', value: PDFTemplates.COMPLETION_CERTIFICATE, icon: FileText },
        ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant={variant} 
                    size={size}
                    disabled={isExporting}
                    className="border-blue-800 text-blue-300 hover:bg-blue-950/50"
                >
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="w-4 h-4 mr-2" />
                    )}
                    Export PDF
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0f1419] border-blue-900/20">
                <div className="px-2 py-1.5 text-xs font-semibold text-blue-400">
                    Select Template
                </div>
                <DropdownMenuSeparator className="bg-blue-900/20" />
                {templates.map((template) => (
                    <DropdownMenuItem
                        key={template.value}
                        onClick={() => handleExport(template.value)}
                        className="text-blue-100 focus:bg-blue-950/50 focus:text-white cursor-pointer"
                    >
                        <template.icon className="w-4 h-4 mr-2" />
                        {template.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}