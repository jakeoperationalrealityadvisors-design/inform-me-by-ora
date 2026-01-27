import React from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ComplexConditionBuilder({ conditionLogic, onChange }) {
    const logic = conditionLogic || { operator: 'AND', groups: [] };

    const addGroup = () => {
        onChange({
            ...logic,
            groups: [...logic.groups, { operator: 'AND', conditions: [{ field: 'priority', operator: 'equals', value: '' }] }]
        });
    };

    const removeGroup = (groupIndex) => {
        onChange({
            ...logic,
            groups: logic.groups.filter((_, i) => i !== groupIndex)
        });
    };

    const updateGroupOperator = (groupIndex, operator) => {
        const newGroups = [...logic.groups];
        newGroups[groupIndex].operator = operator;
        onChange({ ...logic, groups: newGroups });
    };

    const addCondition = (groupIndex) => {
        const newGroups = [...logic.groups];
        newGroups[groupIndex].conditions.push({ field: 'priority', operator: 'equals', value: '' });
        onChange({ ...logic, groups: newGroups });
    };

    const removeCondition = (groupIndex, condIndex) => {
        const newGroups = [...logic.groups];
        newGroups[groupIndex].conditions = newGroups[groupIndex].conditions.filter((_, i) => i !== condIndex);
        onChange({ ...logic, groups: newGroups });
    };

    const updateCondition = (groupIndex, condIndex, field, value) => {
        const newGroups = [...logic.groups];
        newGroups[groupIndex].conditions[condIndex][field] = value;
        onChange({ ...logic, groups: newGroups });
    };

    const duplicateGroup = (groupIndex) => {
        const newGroups = [...logic.groups];
        newGroups.splice(groupIndex + 1, 0, JSON.parse(JSON.stringify(logic.groups[groupIndex])));
        onChange({ ...logic, groups: newGroups });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Label>Match</Label>
                    <Select value={logic.operator} onValueChange={(v) => onChange({ ...logic, operator: v })}>
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AND">ALL</SelectItem>
                            <SelectItem value="OR">ANY</SelectItem>
                        </SelectContent>
                    </Select>
                    <Label>of the following groups:</Label>
                </div>
                <Button type="button" onClick={addGroup} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Group
                </Button>
            </div>

            {logic.groups.length === 0 && (
                <div className="text-center py-8 text-blue-400/70 border-2 border-dashed border-blue-900/40 rounded-lg">
                    No condition groups. Add a group to start building complex logic.
                </div>
            )}

            {logic.groups.map((group, groupIndex) => (
                <Card key={groupIndex} className="p-4 bg-blue-950/40 border-2 border-blue-900/40">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">Group {groupIndex + 1}</Badge>
                            <Select value={group.operator} onValueChange={(v) => updateGroupOperator(groupIndex, v)}>
                                <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AND">AND</SelectItem>
                                    <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-1">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => duplicateGroup(groupIndex)}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => removeGroup(groupIndex)}
                            >
                                <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {group.conditions.map((condition, condIndex) => (
                            <div key={condIndex} className="flex items-center gap-2 bg-[#0f1419] p-2 rounded border border-blue-900/30">
                                <Select 
                                    value={condition.field}
                                    onValueChange={(v) => updateCondition(groupIndex, condIndex, 'field', v)}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="priority">Priority</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="completion_percentage">Completion %</SelectItem>
                                        <SelectItem value="location">Location</SelectItem>
                                        <SelectItem value="assigned_to_email">Assigned To</SelectItem>
                                        <SelectItem value="category_id">Category</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select 
                                    value={condition.operator}
                                    onValueChange={(v) => updateCondition(groupIndex, condIndex, 'operator', v)}
                                >
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="equals">Equals</SelectItem>
                                        <SelectItem value="not_equals">Not Equals</SelectItem>
                                        <SelectItem value="contains">Contains</SelectItem>
                                        <SelectItem value="greater_than">Greater Than</SelectItem>
                                        <SelectItem value="less_than">Less Than</SelectItem>
                                        <SelectItem value="is_empty">Is Empty</SelectItem>
                                        <SelectItem value="is_not_empty">Is Not Empty</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    value={condition.value}
                                    onChange={(e) => updateCondition(groupIndex, condIndex, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="flex-1"
                                />

                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeCondition(groupIndex, condIndex)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>

                                {condIndex < group.conditions.length - 1 && (
                                    <Badge variant="secondary" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs">
                                        {group.operator}
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => addCondition(groupIndex)}
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Condition
                    </Button>

                    {groupIndex < logic.groups.length - 1 && (
                        <div className="flex justify-center mt-3">
                            <Badge className="bg-blue-600 text-white">{logic.operator}</Badge>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}