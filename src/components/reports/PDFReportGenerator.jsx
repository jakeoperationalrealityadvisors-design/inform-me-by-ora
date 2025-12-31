import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
            yPos += 8;

            const summaryData = [
                ['Form Submissions', forms.length.toString()],
                ['Checklist Submissions', checklists.length.toString()],
                ['Completed Checklists', checklists.filter(c => c.status === 'completed').length.toString()],
                ['Total Tasks', tasks.length.toString()],
                ['Completed Tasks', tasks.filter(t => t.status === 'completed').length.toString()],
                ['Overdue Tasks', tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length.toString()],
                ['Total Documents', documents.length.toString()],
                ['Active Automations', automations.filter(a => a.enabled).length.toString()]
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'grid',
                headStyles: { fillColor: [30, 64, 175] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            // Task Breakdown
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(30, 64, 175);
            doc.text('Task Performance', 20, yPos);
            yPos += 8;

            const taskBreakdown = [
                ['Status', 'Count', 'Percentage'],
                ['To Do', tasks.filter(t => t.status === 'todo').length.toString(), `${((tasks.filter(t => t.status === 'todo').length / tasks.length) * 100 || 0).toFixed(1)}%`],
                ['In Progress', tasks.filter(t => t.status === 'in_progress').length.toString(), `${((tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 100 || 0).toFixed(1)}%`],
                ['Completed', tasks.filter(t => t.status === 'completed').length.toString(), `${((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 || 0).toFixed(1)}%`],
                ['Cancelled', tasks.filter(t => t.status === 'cancelled').length.toString(), `${((tasks.filter(t => t.status === 'cancelled').length / tasks.length) * 100 || 0).toFixed(1)}%`]
            ];

            doc.autoTable({
                startY: yPos,
                head: [taskBreakdown[0]],
                body: taskBreakdown.slice(1),
                theme: 'striped',
                headStyles: { fillColor: [30, 64, 175] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            // Priority Distribution
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.text('Task Priority Distribution', 20, yPos);
            yPos += 8;

            const priorityData = [
                ['Priority', 'Count'],
                ['Low', tasks.filter(t => t.priority === 'low').length.toString()],
                ['Medium', tasks.filter(t => t.priority === 'medium').length.toString()],
                ['High', tasks.filter(t => t.priority === 'high').length.toString()],
                ['Urgent', tasks.filter(t => t.priority === 'urgent').length.toString()]
            ];

            doc.autoTable({
                startY: yPos,
                head: [priorityData[0]],
                body: priorityData.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [245, 158, 11] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            // Document Usage
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(30, 64, 175);
            doc.text('Document Usage', 20, yPos);
            yPos += 8;

            const totalStorage = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);
            const avgSize = documents.length > 0 ? totalStorage / documents.length : 0;

            const docData = [
                ['Total Documents', documents.length.toString()],
                ['Total Storage', `${(totalStorage / 1024 / 1024).toFixed(2)} MB`],
                ['Average File Size', `${(avgSize / 1024).toFixed(2)} KB`],
                ['Active Documents', documents.filter(d => d.status === 'active').length.toString()],
                ['Archived Documents', documents.filter(d => d.status === 'archived').length.toString()]
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: docData,
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22] },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            // Automation Summary
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(14);
            doc.text('Automation Performance', 20, yPos);
            yPos += 8;

            const totalExecutions = automations.reduce((sum, a) => sum + (a.execution_count || 0), 0);
            const automationData = [
                ['Total Automations', automations.length.toString()],
                ['Active Automations', automations.filter(a => a.enabled).length.toString()],
                ['Inactive Automations', automations.filter(a => !a.enabled).length.toString()],
                ['Total Executions', totalExecutions.toString()],
                ['Avg. Executions per Rule', automations.length > 0 ? (totalExecutions / automations.length).toFixed(1) : '0']
            ];

            doc.autoTable({
                startY: yPos,
                head: [['Metric', 'Value']],
                body: automationData,
                theme: 'grid',
                headStyles: { fillColor: [234, 179, 8] },
                margin: { left: 20, right: 20 }
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