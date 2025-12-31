import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PDFReportGenerator({
    dateRange,
    forms,
    checklists,
    tasks,
    documents,
    automations,
    selectedCategory,
    selectedUser,
    categories
}) {
    const [generating, setGenerating] = useState(false);

    const generatePDF = async () => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            let yPos = 20;

            // Header
            doc.setFontSize(20);
            doc.setTextColor(255, 140, 0);
            doc.text('Analytics Report', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 20, yPos);
            yPos += 6;
            doc.text(`Period: ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`, 20, yPos);
            yPos += 10;

            // Filters
            if (selectedCategory !== 'all' || selectedUser !== 'all') {
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                if (selectedCategory !== 'all') {
                    const catName = categories.find(c => c.id === selectedCategory)?.name || 'Unknown';
                    doc.text(`Category: ${catName}`, 20, yPos);
                    yPos += 5;
                }
                if (selectedUser !== 'all') {
                    doc.text(`User: ${selectedUser}`, 20, yPos);
                    yPos += 5;
                }
                yPos += 5;
            }

            // Summary Section
            doc.setFontSize(14);
            doc.setTextColor(30, 64, 175);
            doc.text('Executive Summary', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(0);
            const metrics = [
                ['Form Submissions:', forms.length],
                ['Checklist Submissions:', checklists.length],
                ['Completed Checklists:', checklists.filter(c => c.status === 'completed').length],
                ['Total Tasks:', tasks.length],
                ['Completed Tasks:', tasks.filter(t => t.status === 'completed').length],
                ['Overdue Tasks:', tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length],
                ['Total Documents:', documents.length],
                ['Active Automations:', automations.filter(a => a.enabled).length]
            ];

            metrics.forEach(([label, value]) => {
                doc.text(`${label} ${value}`, 25, yPos);
                yPos += 6;
            });

            yPos += 10;

            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Task Performance
            doc.setFontSize(14);
            doc.setTextColor(30, 64, 175);
            doc.text('Task Performance', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(0);
            const taskStats = [
                ['To Do:', tasks.filter(t => t.status === 'todo').length, `(${((tasks.filter(t => t.status === 'todo').length / tasks.length) * 100 || 0).toFixed(1)}%)`],
                ['In Progress:', tasks.filter(t => t.status === 'in_progress').length, `(${((tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 100 || 0).toFixed(1)}%)`],
                ['Completed:', tasks.filter(t => t.status === 'completed').length, `(${((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 || 0).toFixed(1)}%)`]
            ];

            taskStats.forEach(([label, count, pct]) => {
                doc.text(`${label} ${count} ${pct}`, 25, yPos);
                yPos += 6;
            });

            yPos += 10;

            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            // Priority Distribution
            doc.setFontSize(14);
            doc.setTextColor(30, 64, 175);
            doc.text('Task Priority', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(0);
            ['Low', 'Medium', 'High', 'Urgent'].forEach(priority => {
                const count = tasks.filter(t => t.priority === priority.toLowerCase()).length;
                doc.text(`${priority}: ${count}`, 25, yPos);
                yPos += 6;
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
                doc.text(
                    'Inform Me by ORA',
                    20,
                    doc.internal.pageSize.getHeight() - 10
                );
            }

            // Save
            doc.save(`analytics-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
            toast.success('PDF report generated successfully');
        } catch (error) {
            console.error('PDF generation error:', error);
            toast.error('Failed to generate PDF report');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Button 
            onClick={generatePDF} 
            disabled={generating}
            variant="outline" 
            className="gap-2 border-purple-600 text-purple-300"
        >
            {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <FileDown className="w-4 h-4" />
            )}
            PDF
        </Button>
    );
}