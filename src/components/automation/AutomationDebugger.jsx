import React, { useState } from 'react';
import { Play, Check, X, Clock, AlertCircle, Code, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from 'framer-motion';

const ExecutionStep = ({ step, index }) => {
    const [expanded, setExpanded] = useState(false);
    
    const getStatusIcon = () => {
        switch (step.status) {
            case 'success':
                return <Check className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <X className="w-4 h-4 text-red-600" />;
            case 'running':
                return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };
    
    const getStatusColor = () => {
        switch (step.status) {
            case 'success':
                return 'border-green-500 bg-green-50';
            case 'failed':
                return 'border-red-500 bg-red-50';
            case 'running':
                return 'border-blue-500 bg-blue-50';
            default:
                return 'border-gray-300 bg-gray-50';
        }
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border-l-4 rounded-lg p-4 mb-3 ${getStatusColor()}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getStatusIcon()}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                                Step {index + 1}
                            </Badge>
                            <span className="font-semibold text-sm">{step.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{step.description}</p>
                        
                        {step.duration && (
                            <p className="text-xs text-gray-500 mt-1">
                                Duration: {step.duration}ms
                            </p>
                        )}
                    </div>
                </div>
                
                {(step.details || step.error) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </Button>
                )}
            </div>
            
            <AnimatePresence>
                {expanded && (step.details || step.error) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-gray-200"
                    >
                        {step.error && (
                            <Alert className="bg-red-100 border-red-300 mb-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <AlertDescription className="text-xs text-red-800">
                                    {step.error}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        {step.details && (
                            <div className="bg-gray-900 rounded p-3 text-xs">
                                <pre className="text-green-400 overflow-x-auto">
                                    {JSON.stringify(step.details, null, 2)}
                                </pre>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function AutomationDebugger({ automation, onClose }) {
    const [testData, setTestData] = useState(JSON.stringify({
        submission_id: 'test-123',
        submission_type: 'form',
        title: 'Test Submission',
        priority: 'high',
        status: 'submitted',
        completion_percentage: 100,
        location: 'Test Location',
        assigned_to_email: 'user@example.com',
        submitted_by_email: 'submitter@example.com'
    }, null, 2));
    
    const [executionSteps, setExecutionSteps] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [executionComplete, setExecutionComplete] = useState(false);
    
    const addStep = (step) => {
        setExecutionSteps(prev => [...prev, { ...step, timestamp: Date.now() }]);
    };
    
    const updateLastStep = (updates) => {
        setExecutionSteps(prev => {
            const newSteps = [...prev];
            newSteps[newSteps.length - 1] = { ...newSteps[newSteps.length - 1], ...updates };
            return newSteps;
        });
    };
    
    const evaluateSingleCondition = (condition, data) => {
        const value = data[condition.field];
        const targetValue = condition.value;
        
        switch (condition.operator) {
            case 'equals':
                return value == targetValue;
            case 'not_equals':
                return value != targetValue;
            case 'contains':
                return String(value || '').toLowerCase().includes(String(targetValue).toLowerCase());
            case 'greater_than':
                return Number(value) > Number(targetValue);
            case 'less_than':
                return Number(value) < Number(targetValue);
            case 'is_empty':
                return !value || value === '';
            case 'is_not_empty':
                return value && value !== '';
            default:
                return true;
        }
    };
    
    const evaluateConditionLogic = (conditionLogic, data) => {
        if (!conditionLogic || !conditionLogic.groups || conditionLogic.groups.length === 0) {
            return { passed: true, details: { message: 'No conditions to evaluate' } };
        }
        
        const groupResults = conditionLogic.groups.map((group, groupIndex) => {
            const conditionResults = group.conditions.map((condition, condIndex) => {
                const result = evaluateSingleCondition(condition, data);
                return {
                    condition: `${condition.field} ${condition.operator} ${condition.value}`,
                    result,
                    actualValue: data[condition.field]
                };
            });
            
            const groupPassed = group.operator === 'OR'
                ? conditionResults.some(r => r.result)
                : conditionResults.every(r => r.result);
            
            return { groupIndex: groupIndex + 1, operator: group.operator, conditions: conditionResults, passed: groupPassed };
        });
        
        const overallPassed = conditionLogic.operator === 'OR'
            ? groupResults.some(g => g.passed)
            : groupResults.every(g => g.passed);
        
        return { passed: overallPassed, details: { operator: conditionLogic.operator, groups: groupResults } };
    };
    
    const simulateAction = async (action, actionIndex, data) => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
        
        const actionDetails = {
            type: action.type,
            config: action.config,
            triggerData: data
        };
        
        // Simulate different action outcomes
        if (action.type === 'custom_code') {
            try {
                // Don't actually execute, just validate syntax
                new Function('trigger_data', 'action_config', 'base44', action.code_snippet);
                return { success: true, details: { message: 'Code syntax valid', code: action.code_snippet } };
            } catch (error) {
                throw new Error(`Code syntax error: ${error.message}`);
            }
        }
        
        return { success: true, details: actionDetails };
    };
    
    const runDebugger = async () => {
        setIsRunning(true);
        setExecutionSteps([]);
        setExecutionComplete(false);
        
        let data;
        try {
            data = JSON.parse(testData);
        } catch (error) {
            addStep({
                name: 'Parse Test Data',
                description: 'Parsing JSON test data',
                status: 'failed',
                error: `Invalid JSON: ${error.message}`
            });
            setIsRunning(false);
            return;
        }
        
        const startTime = Date.now();
        
        // Step 1: Start
        addStep({
            name: 'Trigger',
            description: `Automation triggered: ${automation.trigger_type}`,
            status: 'running'
        });
        await new Promise(resolve => setTimeout(resolve, 300));
        updateLastStep({ status: 'success', duration: Date.now() - startTime });
        
        // Step 2: Evaluate Conditions
        const conditionStartTime = Date.now();
        addStep({
            name: 'Evaluate Conditions',
            description: 'Checking if conditions are met',
            status: 'running'
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const conditionResult = evaluateConditionLogic(automation.condition_logic, data);
        updateLastStep({
            status: conditionResult.passed ? 'success' : 'failed',
            duration: Date.now() - conditionStartTime,
            details: conditionResult.details,
            error: conditionResult.passed ? null : 'Conditions not met - automation will not execute'
        });
        
        if (!conditionResult.passed) {
            setIsRunning(false);
            setExecutionComplete(true);
            return;
        }
        
        // Step 3: Execute Actions
        for (let i = 0; i < automation.actions.length; i++) {
            const action = automation.actions[i];
            const actionStartTime = Date.now();
            
            addStep({
                name: `Action: ${action.type}`,
                description: `Executing ${action.type.replace(/_/g, ' ')}`,
                status: 'running'
            });
            
            try {
                const result = await simulateAction(action, i, data);
                updateLastStep({
                    status: 'success',
                    duration: Date.now() - actionStartTime,
                    details: result.details
                });
            } catch (error) {
                updateLastStep({
                    status: 'failed',
                    duration: Date.now() - actionStartTime,
                    error: error.message
                });
            }
        }
        
        setIsRunning(false);
        setExecutionComplete(true);
    };
    
    return (
        <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Code className="w-5 h-5" />
                    Automation Debugger
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Test Data Input */}
                    <div>
                        <Label className="mb-2 block">Test Data (JSON)</Label>
                        <Textarea
                            value={testData}
                            onChange={(e) => setTestData(e.target.value)}
                            className="font-mono text-xs h-64 bg-slate-900 text-green-400"
                            disabled={isRunning}
                        />
                        <Button
                            onClick={runDebugger}
                            disabled={isRunning}
                            className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {isRunning ? 'Running...' : 'Run Debug Session'}
                        </Button>
                    </div>
                    
                    {/* Right: Execution Steps */}
                    <div>
                        <Label className="mb-2 block">Execution Flow</Label>
                        <div className="h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                            {executionSteps.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                    Click "Run Debug Session" to start
                                </div>
                            ) : (
                                executionSteps.map((step, index) => (
                                    <ExecutionStep key={index} step={step} index={index} />
                                ))
                            )}
                        </div>
                        
                        {executionComplete && (
                            <Alert className="mt-3 bg-green-50 border-green-300">
                                <Check className="w-4 h-4 text-green-600" />
                                <AlertDescription className="text-sm text-green-800">
                                    Debug session complete. Review execution steps above.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                        <strong>Note:</strong> This is a simulation mode. Actions are validated but not actually executed. 
                        Use the regular tester to execute actions against real data.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}