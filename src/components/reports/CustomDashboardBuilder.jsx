import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_WIDGETS = [
    { id: 'metrics', name: 'Key Metrics Overview', default: true },
    { id: 'completion', name: 'Completion Rates', default: true },
    { id: 'tasks', name: 'Task Efficiency', default: true },
    { id: 'automation', name: 'Automation Analytics', default: true },
    { id: 'documents', name: 'Document Usage', default: true }
];

export default function CustomDashboardBuilder({ onConfigChange }) {
    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('dashboardConfig');
        return saved ? JSON.parse(saved) : AVAILABLE_WIDGETS.filter(w => w.default).map(w => w.id);
    });

    const handleToggle = (widgetId) => {
        setConfig(prev => 
            prev.includes(widgetId) 
                ? prev.filter(id => id !== widgetId)
                : [...prev, widgetId]
        );
    };

    const handleSave = () => {
        localStorage.setItem('dashboardConfig', JSON.stringify(config));
        onConfigChange?.(config);
        toast.success('Dashboard layout saved');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full text-blue-400">
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0f1419] border-blue-900/20 text-white">
                <DialogHeader>
                    <DialogTitle>Customize Dashboard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-blue-300">
                        Select which widgets to display on your dashboard
                    </p>
                    {AVAILABLE_WIDGETS.map(widget => (
                        <div key={widget.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={widget.id}
                                checked={config.includes(widget.id)}
                                onCheckedChange={() => handleToggle(widget.id)}
                            />
                            <Label 
                                htmlFor={widget.id}
                                className="text-sm text-white cursor-pointer"
                            >
                                {widget.name}
                            </Label>
                        </div>
                    ))}
                    <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Layout
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function useDashboardConfig() {
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('dashboardConfig');
        return saved ? JSON.parse(saved) : AVAILABLE_WIDGETS.filter(w => w.default).map(w => w.id);
    });

    return { config, setConfig };
}