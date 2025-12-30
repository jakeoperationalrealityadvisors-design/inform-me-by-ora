import jsPDF from 'jspdf';
import { format } from 'date-fns';

export const PDFTemplates = {
    STANDARD: 'standard',
    INCIDENT_REPORT: 'incident',
    COMPLETION_CERTIFICATE: 'certificate',
    INSPECTION: 'inspection'
};

class PDFExporter {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = this.margin;
    }

    // Initialize new document
    init() {
        this.doc = new jsPDF();
        this.currentY = this.margin;
    }

    // Add header with logo and title
    addHeader(title, subtitle) {
        this.doc.setFillColor(37, 99, 235); // Blue
        this.doc.rect(0, 0, this.pageWidth, 40, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(24);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(title, this.margin, 20);
        
        if (subtitle) {
            this.doc.setFontSize(12);
            this.doc.setFont(undefined, 'normal');
            this.doc.text(subtitle, this.margin, 30);
        }
        
        this.currentY = 50;
        this.doc.setTextColor(0, 0, 0);
    }

    // Add section with background
    addSection(title, content) {
        this.checkPageBreak(30);
        
        // Section header
        this.doc.setFillColor(240, 242, 245);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');
        
        this.doc.setFontSize(14);
        this.doc.setFont(undefined, 'bold');
        this.doc.setTextColor(30, 41, 59);
        this.doc.text(title, this.margin + 5, this.currentY + 7);
        
        this.currentY += 15;
        
        // Content
        if (typeof content === 'function') {
            content();
        } else if (Array.isArray(content)) {
            content.forEach(item => this.addText(item));
        } else {
            this.addText(content);
        }
        
        this.currentY += 5;
    }

    // Add text with word wrap
    addText(text, options = {}) {
        this.checkPageBreak(20);
        
        this.doc.setFontSize(options.fontSize || 11);
        this.doc.setFont(undefined, options.bold ? 'bold' : 'normal');
        this.doc.setTextColor(options.color || [0, 0, 0]);
        
        const maxWidth = this.pageWidth - 2 * this.margin - (options.indent || 0);
        const lines = this.doc.splitTextToSize(text, maxWidth);
        
        lines.forEach(line => {
            this.checkPageBreak(10);
            this.doc.text(line, this.margin + (options.indent || 0), this.currentY);
            this.currentY += options.lineHeight || 7;
        });
    }

    // Add key-value pair
    addField(label, value, options = {}) {
        this.checkPageBreak(15);
        
        this.doc.setFontSize(10);
        this.doc.setFont(undefined, 'bold');
        this.doc.setTextColor(71, 85, 105);
        this.doc.text(label + ':', this.margin + (options.indent || 0), this.currentY);
        
        this.doc.setFont(undefined, 'normal');
        this.doc.setTextColor(0, 0, 0);
        const valueText = value || '—';
        const lines = this.doc.splitTextToSize(String(valueText), 130);
        this.doc.text(lines, this.margin + 50 + (options.indent || 0), this.currentY);
        
        this.currentY += Math.max(lines.length * 5, 8);
    }

    // Add checklist items
    addChecklistItems(items, completedIds, itemNotes) {
        items.forEach((item, index) => {
            this.checkPageBreak(15);
            
            const isCompleted = completedIds.includes(item.id);
            
            // Checkbox
            this.doc.setDrawColor(isCompleted ? 34, 197, 94 : 203, 213, 225);
            this.doc.setFillColor(isCompleted ? 34, 197, 94 : 255, 255, 255);
            this.doc.rect(this.margin, this.currentY - 3, 5, 5, isCompleted ? 'FD' : 'D');
            
            if (isCompleted) {
                // Checkmark
                this.doc.setDrawColor(255, 255, 255);
                this.doc.setLineWidth(0.5);
                this.doc.line(this.margin + 1, this.currentY, this.margin + 2, this.currentY + 2);
                this.doc.line(this.margin + 2, this.currentY + 2, this.margin + 4, this.currentY - 2);
            }
            
            // Item text
            this.doc.setFontSize(10);
            this.doc.setFont(undefined, 'normal');
            this.doc.setTextColor(isCompleted ? 100, 116, 139 : 0, 0, 0);
            const text = `${index + 1}. ${item.text}`;
            const lines = this.doc.splitTextToSize(text, 150);
            this.doc.text(lines, this.margin + 8, this.currentY);
            
            this.currentY += lines.length * 5;
            
            // Add notes if available
            if (itemNotes && itemNotes[item.id]) {
                this.doc.setFontSize(9);
                this.doc.setTextColor(100, 116, 139);
                this.doc.text('Note: ' + itemNotes[item.id], this.margin + 8, this.currentY);
                this.currentY += 5;
            }
            
            this.currentY += 3;
        });
    }

    // Add footer
    addFooter() {
        const pageCount = this.doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            this.doc.setFontSize(9);
            this.doc.setTextColor(148, 163, 184);
            this.doc.text(
                `Page ${i} of ${pageCount}`,
                this.pageWidth / 2,
                this.pageHeight - 10,
                { align: 'center' }
            );
            this.doc.text(
                `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
                this.pageWidth - this.margin,
                this.pageHeight - 10,
                { align: 'right' }
            );
        }
    }

    // Check if we need a page break
    checkPageBreak(requiredSpace) {
        if (this.currentY + requiredSpace > this.pageHeight - 30) {
            this.doc.addPage();
            this.currentY = this.margin;
        }
    }

    // Generate Form Submission PDF
    generateFormPDF(submission, formTemplate, template = PDFTemplates.STANDARD) {
        this.init();
        
        if (template === PDFTemplates.INCIDENT_REPORT) {
            this.generateIncidentReport(submission, formTemplate);
        } else if (template === PDFTemplates.COMPLETION_CERTIFICATE) {
            this.generateCompletionCertificate(submission, formTemplate);
        } else {
            this.generateStandardFormReport(submission, formTemplate);
        }
        
        this.addFooter();
        return this.doc;
    }

    // Generate Checklist Submission PDF
    generateChecklistPDF(submission, checklistTemplate, template = PDFTemplates.STANDARD) {
        this.init();
        
        if (template === PDFTemplates.INSPECTION) {
            this.generateInspectionReport(submission, checklistTemplate);
        } else if (template === PDFTemplates.COMPLETION_CERTIFICATE) {
            this.generateChecklistCertificate(submission, checklistTemplate);
        } else {
            this.generateStandardChecklistReport(submission, checklistTemplate);
        }
        
        this.addFooter();
        return this.doc;
    }

    // Standard Form Report
    generateStandardFormReport(submission, formTemplate) {
        this.addHeader(submission.form_title, 'Form Submission Report');
        
        this.addSection('Submission Details', () => {
            this.addField('Submitted By', submission.submitted_by_name);
            this.addField('Submitted On', format(new Date(submission.created_date), 'MMMM dd, yyyy HH:mm'));
            if (submission.location) this.addField('Location', submission.location);
            this.addField('Status', submission.status.toUpperCase());
        });
        
        if (submission.responses && formTemplate?.fields) {
            this.addSection('Form Responses', () => {
                formTemplate.fields.forEach(field => {
                    const value = submission.responses[field.id];
                    if (value !== undefined && value !== null && value !== '') {
                        this.addField(field.label, this.formatFieldValue(field, value));
                    }
                });
            });
        }
        
        if (submission.notes) {
            this.addSection('Additional Notes', submission.notes);
        }
    }

    // Incident Report Template
    generateIncidentReport(submission, formTemplate) {
        this.addHeader('INCIDENT REPORT', submission.form_title);
        
        // Highlight box for critical info
        this.doc.setDrawColor(239, 68, 68);
        this.doc.setLineWidth(1);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30);
        this.currentY += 5;
        
        this.addField('Report Date', format(new Date(submission.created_date), 'MMMM dd, yyyy HH:mm'));
        this.addField('Reporter', submission.submitted_by_name);
        this.addField('Location', submission.location || 'Not specified');
        this.addField('Status', submission.status.toUpperCase(), { color: [239, 68, 68] });
        
        this.currentY += 10;
        
        if (submission.responses && formTemplate?.fields) {
            this.addSection('Incident Details', () => {
                formTemplate.fields.forEach(field => {
                    const value = submission.responses[field.id];
                    if (value !== undefined && value !== null && value !== '') {
                        this.addField(field.label, this.formatFieldValue(field, value));
                    }
                });
            });
        }
    }

    // Completion Certificate
    generateCompletionCertificate(submission, formTemplate) {
        // Certificate border
        this.doc.setDrawColor(37, 99, 235);
        this.doc.setLineWidth(2);
        this.doc.rect(10, 10, this.pageWidth - 20, this.pageHeight - 20);
        
        // Title
        this.doc.setFontSize(32);
        this.doc.setFont(undefined, 'bold');
        this.doc.setTextColor(37, 99, 235);
        this.doc.text('CERTIFICATE', this.pageWidth / 2, 50, { align: 'center' });
        
        this.doc.setFontSize(18);
        this.doc.text('OF COMPLETION', this.pageWidth / 2, 65, { align: 'center' });
        
        // Content
        this.doc.setFontSize(14);
        this.doc.setFont(undefined, 'normal');
        this.doc.setTextColor(0, 0, 0);
        this.currentY = 90;
        
        this.doc.text('This certifies that', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 15;
        
        this.doc.setFontSize(20);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(submission.submitted_by_name || 'Team Member', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 15;
        
        this.doc.setFontSize(14);
        this.doc.setFont(undefined, 'normal');
        this.doc.text('has successfully completed', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 12;
        
        this.doc.setFontSize(16);
        this.doc.setFont(undefined, 'bold');
        this.doc.text(submission.form_title, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 20;
        
        this.doc.setFontSize(12);
        this.doc.setFont(undefined, 'normal');
        if (submission.location) {
            this.doc.text('Location: ' + submission.location, this.pageWidth / 2, this.currentY, { align: 'center' });
            this.currentY += 10;
        }
        
        this.doc.text('Date: ' + format(new Date(submission.created_date), 'MMMM dd, yyyy'), this.pageWidth / 2, this.currentY, { align: 'center' });
        
        // Signature line
        this.currentY = 220;
        this.doc.setDrawColor(0, 0, 0);
        this.doc.line(this.pageWidth / 2 - 40, this.currentY, this.pageWidth / 2 + 40, this.currentY);
        this.doc.setFontSize(10);
        this.doc.text('Authorized Signature', this.pageWidth / 2, this.currentY + 7, { align: 'center' });
    }

    // Standard Checklist Report
    generateStandardChecklistReport(submission, checklistTemplate) {
        this.addHeader(submission.checklist_title, 'Checklist Completion Report');
        
        this.addSection('Completion Details', () => {
            this.addField('Completed By', submission.submitted_by_name);
            this.addField('Completed On', format(new Date(submission.created_date), 'MMMM dd, yyyy HH:mm'));
            if (submission.location) this.addField('Location', submission.location);
            this.addField('Completion Rate', `${submission.completion_percentage}%`);
            this.addField('Status', submission.status.toUpperCase());
        });
        
        if (checklistTemplate?.items) {
            this.addSection('Checklist Items', () => {
                this.addChecklistItems(
                    checklistTemplate.items,
                    submission.completed_items || [],
                    submission.item_notes || {}
                );
            });
        }
    }

    // Inspection Report Template
    generateInspectionReport(submission, checklistTemplate) {
        this.addHeader('INSPECTION REPORT', submission.checklist_title);
        
        this.addSection('Inspection Information', () => {
            this.addField('Inspector', submission.submitted_by_name);
            this.addField('Inspection Date', format(new Date(submission.created_date), 'MMMM dd, yyyy'));
            this.addField('Location/Site', submission.location || 'Not specified');
            this.addField('Completion', `${submission.completion_percentage}%`);
        });
        
        if (checklistTemplate?.items) {
            const completed = submission.completed_items || [];
            const totalItems = checklistTemplate.items.length;
            const completedCount = completed.length;
            
            // Summary box
            this.doc.setFillColor(240, 242, 245);
            this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 15, 'F');
            this.doc.setFontSize(12);
            this.doc.setFont(undefined, 'bold');
            this.doc.text(
                `Items Passed: ${completedCount} / ${totalItems}`,
                this.margin + 5,
                this.currentY + 10
            );
            this.currentY += 20;
            
            this.addSection('Inspection Items', () => {
                this.addChecklistItems(
                    checklistTemplate.items,
                    completed,
                    submission.item_notes || {}
                );
            });
        }
    }

    // Checklist Certificate
    generateChecklistCertificate(submission, checklistTemplate) {
        this.generateCompletionCertificate(
            { ...submission, form_title: submission.checklist_title },
            checklistTemplate
        );
    }

    // Format field values
    formatFieldValue(field, value) {
        if (field.type === 'date') {
            return format(new Date(value), 'MMMM dd, yyyy');
        }
        if (field.type === 'checkbox') {
            return value ? 'Yes' : 'No';
        }
        if (field.type === 'photo' || field.type === 'signature') {
            return '[Image/Signature attached]';
        }
        return String(value);
    }

    // Save the PDF
    save(filename) {
        this.doc.save(filename);
    }

    // Get as blob for preview
    getBlob() {
        return this.doc.output('blob');
    }
}

export default PDFExporter;