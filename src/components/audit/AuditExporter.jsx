import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileDown, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AuditExporter({ logs, dateRange, filters }) {
    const [exporting, setExporting] = useState(false);

    const exportCSV = () => {
        const csvData = [
            ['Timestamp', 'User', 'Email', 'Action', 'Entity Type', 'Entity Title', 'Description', 'IP Address'],
            ...logs.map(log => [
                format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss'),
                log.user_name || '',
                log.user_email || '',
                log.action_type,
                log.entity_type || '',
                log.entity_title || '',
                log.description,
                log.ip_address || ''
            ])
        ];

        const csv = csvData.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Audit log exported to CSV');
    };

    const exportPDF = async () => {
        setExporting(true);
        try {
            const doc = new jsPDF({ orientation: 'landscape' });
            let yPos = 20;

            // Header
            doc.setFontSize(18);
            doc.setTextColor(255, 140, 0);
            doc.text('Audit Trail Report', 20, yPos);
            yPos += 10;

            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 20, yPos);
            yPos += 5;
            if (dateRange.from && dateRange.to) {
                doc.text(`Period: ${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`, 20, yPos);
                yPos += 5;
            }
            
            // Filters
            if (filters.user !== 'all') {
                doc.text(`User Filter: ${filters.user}`, 20, yPos);
                yPos += 5;
            }
            if (filters.action !== 'all') {
                doc.text(`Action Filter: ${filters.action}`, 20, yPos);
                yPos += 5;
            }
            yPos += 5;

            // Summary
            doc.setFontSize(11);
            doc.setTextColor(30, 64, 175);
            doc.text(`Total Entries: ${logs.length}`, 20, yPos);
            yPos += 10;

            // Table
            const tableData = logs.map(log => [
                format(new Date(log.created_date), 'MM/dd HH:mm'),
                (log.user_name || log.user_email || 'Unknown').substring(0, 20),
                log.action_type.replace(/_/g, ' ').substring(0, 25),
                (log.entity_title || '').substring(0, 30),
                log.description.substring(0, 40)
            ]);

            doc.autoTable({
                startY: yPos,
                head: [['Timestamp', 'User', 'Action', 'Target', 'Description']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [30, 64, 175], fontSize: 8 },
                bodyStyles: { fontSize: 7 },
                margin: { left: 10, right: 10 },
                styles: { cellPadding: 2 }
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
            }

            doc.save(`audit-log-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
            toast.success('Audit log exported to PDF');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Button 
                onClick={exportCSV}
                variant="outline"
                className="gap-2 border-blue-600 text-blue-300"
            >
                <Download className="w-4 h-4" />
                CSV
            </Button>
            <Button 
                onClick={exportPDF}
                disabled={exporting}
                variant="outline"
                className="gap-2 border-purple-600 text-purple-300"
            >
                {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <FileDown className="w-4 h-4" />
                )}
                PDF
            </Button>
        </div>
    );
}