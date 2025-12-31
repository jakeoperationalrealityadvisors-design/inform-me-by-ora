import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Download, Database, FileText, CheckSquare, ClipboardList, FolderOpen, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useUserRole } from '@/components/auth/RoleGuard';

export default function ExportData() {
    const { user, isAdmin } = useUserRole();
    const [selectedData, setSelectedData] = useState({
        forms: true,
        checklists: true,
        formSubmissions: true,
        checklistSubmissions: true,
        documents: false,
        tasks: true,
        categories: true,
        automations: isAdmin
    });

    const exportMutation = useMutation({
        mutationFn: async () => {
            const exportData = {};

            if (selectedData.forms) {
                exportData.forms = await base44.entities.FormTemplate.list();
            }
            if (selectedData.checklists) {
                exportData.checklists = await base44.entities.ChecklistTemplate.list();
            }
            if (selectedData.formSubmissions) {
                exportData.formSubmissions = await base44.entities.FormSubmission.list();
            }
            if (selectedData.checklistSubmissions) {
                exportData.checklistSubmissions = await base44.entities.ChecklistSubmission.list();
            }
            if (selectedData.documents) {
                exportData.documents = await base44.entities.Document.list();
            }
            if (selectedData.tasks) {
                exportData.tasks = await base44.entities.Task.filter({ assigned_to_email: user.email });
            }
            if (selectedData.categories) {
                exportData.categories = await base44.entities.Category.list();
            }
            if (selectedData.automations && isAdmin) {
                exportData.automations = await base44.entities.AutomationRule.list();
            }

            // Add metadata
            exportData._metadata = {
                exportDate: new Date().toISOString(),
                exportedBy: user.email,
                organizationId: user.organization_id,
                version: '1.0'
            };

            return exportData;
        },
        onSuccess: (data) => {
            // Create JSON file and download
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `informme-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Data exported successfully!');
        },
        onError: (error) => {
            toast.error('Export failed: ' + error.message);
        }
    });

    const handleExport = () => {
        if (!Object.values(selectedData).some(v => v)) {
            toast.error('Please select at least one data type to export');
            return;
        }
        exportMutation.mutate();
    };

    const dataTypes = [
        { key: 'forms', label: 'Form Templates', icon: FileText, description: 'All your form templates' },
        { key: 'checklists', label: 'Checklist Templates', icon: CheckSquare, description: 'All your checklist templates' },
        { key: 'formSubmissions', label: 'Form Submissions', icon: ClipboardList, description: 'All form submission data' },
        { key: 'checklistSubmissions', label: 'Checklist Submissions', icon: ClipboardList, description: 'All checklist submission data' },
        { key: 'documents', label: 'Document Metadata', icon: FolderOpen, description: 'Document information (files not included)' },
        { key: 'tasks', label: 'Your Tasks', icon: ListTodo, description: 'Tasks assigned to you' },
        { key: 'categories', label: 'Categories', icon: Database, description: 'All categories' },
        ...(isAdmin ? [{ key: 'automations', label: 'Automation Rules', icon: Database, description: 'All automation rules' }] : [])
    ];

    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to={createPageUrl('Settings')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>

                <Card className="bg-[#0f1419] border-blue-900/30">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] flex items-center justify-center">
                                <Download className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-white">Export Your Data</CardTitle>
                                <CardDescription className="text-blue-400">
                                    Download a complete copy of your data in JSON format
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-blue-950/30 border border-blue-900/30 rounded-lg p-4">
                            <p className="text-blue-200 text-sm">
                                ℹ️ Your data will be exported in JSON format, which can be opened with any text editor or imported into other systems. Document files are not included in the export - only metadata.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-white font-semibold">Select data to export:</h3>
                            {dataTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <div key={type.key} className="flex items-start gap-3 p-4 rounded-lg bg-[#0a0e17] border border-blue-900/30">
                                        <Checkbox
                                            id={type.key}
                                            checked={selectedData[type.key]}
                                            onCheckedChange={(checked) => 
                                                setSelectedData({ ...selectedData, [type.key]: checked })
                                            }
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor={type.key} className="flex items-center gap-2 text-white font-medium cursor-pointer">
                                                <Icon className="w-4 h-4 text-[#FF8C00]" />
                                                {type.label}
                                            </Label>
                                            <p className="text-sm text-blue-400 mt-1">{type.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={exportMutation.isPending}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] h-12"
                        >
                            {exportMutation.isPending ? (
                                'Exporting...'
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Data
                                </>
                            )}
                        </Button>

                        <div className="text-center text-xs text-blue-500">
                            <p>Export is compliant with GDPR Article 20 (Right to Data Portability)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}