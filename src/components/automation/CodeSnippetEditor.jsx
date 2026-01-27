import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function CodeSnippetEditor({ value, onChange }) {
    const [showHelp, setShowHelp] = useState(false);

    const exampleSnippets = [
        {
            name: 'Calculate Days Overdue',
            code: `// Calculate days overdue
const dueDate = new Date(trigger_data.due_date);
const today = new Date();
const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

if (daysOverdue > 0) {
    return {
        message: \`This is \${daysOverdue} days overdue\`,
        severity: daysOverdue > 7 ? 'critical' : 'warning'
    };
}`
        },
        {
            name: 'Check Business Hours',
            code: `// Check if current time is within business hours
const now = new Date();
const hour = now.getHours();
const day = now.getDay();

const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;

return {
    is_business_hours: isBusinessHours,
    message: isBusinessHours ? 'Within business hours' : 'Outside business hours'
};`
        },
        {
            name: 'Format Data for API',
            code: `// Format submission data for external API
const formattedData = {
    external_id: trigger_data.id,
    title: trigger_data.title || trigger_data.form_title,
    submitted_at: new Date(trigger_data.created_date).toISOString(),
    priority_level: trigger_data.priority === 'urgent' ? 1 : 2,
    custom_fields: trigger_data.responses
};

return formattedData;`
        }
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Custom JavaScript Code
                </Label>
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowHelp(!showHelp)}
                >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    {showHelp ? 'Hide' : 'Show'} Examples
                </Button>
            </div>

            {showHelp && (
                <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">Available Variables:</p>
                    <ul className="text-xs text-blue-700 space-y-1 ml-4">
                        <li><code className="bg-blue-100 px-1 rounded">trigger_data</code> - Data from the trigger event</li>
                        <li><code className="bg-blue-100 px-1 rounded">action_config</code> - Configuration from this action</li>
                        <li><code className="bg-blue-100 px-1 rounded">base44</code> - Access to InForm' Me by ORA SDK (asServiceRole)</li>
                    </ul>

                    <div className="mt-3">
                        <p className="text-sm text-blue-800 font-medium mb-2">Example Snippets:</p>
                        <div className="space-y-2">
                            {exampleSnippets.map((snippet, idx) => (
                                <div key={idx}>
                                    <button
                                        type="button"
                                        onClick={() => onChange(snippet.code)}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {snippet.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Alert className="bg-orange-50 border-orange-200">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription className="text-xs text-orange-800">
                    Custom code runs with service-level permissions. Test thoroughly before enabling.
                </AlertDescription>
            </Alert>

            <Textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="// Your custom JavaScript code here\n// Return an object to pass data to next actions\nreturn { result: 'success' };"
                className="font-mono text-xs min-h-[200px] bg-slate-900 text-green-400 border-slate-700"
                spellCheck={false}
            />

            <p className="text-xs text-blue-400/70">
                Code executes in a sandboxed environment. Use <code className="bg-blue-950/50 px-1 rounded">return</code> to pass data to subsequent actions.
            </p>
        </div>
    );
}