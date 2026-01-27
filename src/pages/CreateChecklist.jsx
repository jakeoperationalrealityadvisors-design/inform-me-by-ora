import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { ArrowLeft, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { logActivity } from '@/components/activity/ActivityLogger';

export default function CreateChecklist() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [checklistData, setChecklistData] = useState({
    title: '',
    description: '',
    category_id: '',
    status: 'active'
  });

  const [items, setItems] = useState([]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => httpClient.entities.Category.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => httpClient.entities.ChecklistTemplate.create(data),
    onSuccess: async (newChecklist) => {
      await logActivity({
        action_type: 'checklist_created',
        entity_type: 'checklist',
        entity_id: newChecklist.id,
        entity_title: newChecklist.title,
        description: `Created checklist template: ${newChecklist.title}`
      });
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast.success('Checklist template created successfully');
      navigate(createPageUrl('Checklists'));
    },
    onError: (error) => {
      toast.error('Failed to create checklist template');
      console.error(error);
    }
  });

  const addItem = () => {
    const newItem = {
      id: `item_${Date.now()}`,
      text: '',
      required: false,
      order: items.length
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  // AI-powered checklist generation
  const generateChecklistMutation = useMutation({
    mutationFn: async (prompt) => {
      const response = await httpClient.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive checklist based on this request: "${prompt}"

Create a checklist with:
- Clear, actionable checklist items
- Logical ordering of steps
- Mix of required and optional items where appropriate
- Items should be specific and measurable

Return a JSON object with title, description, and items array.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  required: { type: "boolean" }
                }
              }
            }
          }
        }
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.title && !checklistData.title) {
        setChecklistData(prev => ({ ...prev, title: data.title }));
      }
      if (data.description && !checklistData.description) {
        setChecklistData(prev => ({ ...prev, description: data.description }));
      }
      if (data.items) {
        const itemsWithIds = data.items.map((item, i) => ({
          id: `item_${Date.now()}_${i}`,
          text: item.text,
          required: item.required || false,
          order: i
        }));
        setItems(itemsWithIds);
      }
      toast.success('Checklist generated from AI!');
    },
    onError: (error) => {
      toast.error('Failed to generate checklist');
      console.error(error);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checklistData.title || items.length === 0) {
      toast.error('Please add a title and at least one checklist item');
      return;
    }

    await createMutation.mutateAsync({
      ...checklistData,
      items
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0e17] pb-20 md:pb-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0a0e17] border-b border-slate-200 dark:border-blue-900/30 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Checklists'))}
              className="text-slate-700 dark:text-[#FF8C00] shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#FF8C00] truncate">
                Create Checklist Template
              </h1>
              <p className="text-sm text-slate-500 dark:text-[#FF8C00]/70">
                Build reusable checklists with AI assistance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6">
        {/* AI Generation Card */}
        <Card className="bg-white dark:bg-[#0a0e17] border-slate-200 dark:border-blue-900/30 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-[#FF8C00] flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI-Powered Checklist Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 dark:text-[#FF8C00]">Describe your checklist</Label>
                <Textarea
                  placeholder="e.g. Daily vehicle inspection checklist, Employee onboarding process, Safety audit checklist..."
                  className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00] mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (e.target.value.trim()) {
                        generateChecklistMutation.mutate(e.target.value.trim());
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <p className="text-xs text-slate-500 dark:text-[#FF8C00]/70 mt-1">
                  Press Enter to generate. AI will create a complete checklist with all necessary items.
                </p>
              </div>
              {generateChecklistMutation.isPending && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating checklist...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white dark:bg-[#0a0e17] border-slate-200 dark:border-blue-900/30">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-[#FF8C00]">Checklist Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-700 dark:text-[#FF8C00]">Title *</Label>
                <Input
                  value={checklistData.title}
                  onChange={(e) => setChecklistData({ ...checklistData, title: e.target.value })}
                  placeholder="Enter checklist title"
                  required
                  className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-[#FF8C00]">Description</Label>
                <Textarea
                  value={checklistData.description}
                  onChange={(e) => setChecklistData({ ...checklistData, description: e.target.value })}
                  placeholder="Enter checklist description"
                  className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-[#FF8C00]">Category</Label>
                <Select
                  value={checklistData.category_id}
                  onValueChange={(value) => setChecklistData({ ...checklistData, category_id: value })}
                >
                  <SelectTrigger className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Items */}
          <Card className="bg-white dark:bg-[#0a0e17] border-slate-200 dark:border-blue-900/30 mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm sm:text-base text-slate-900 dark:text-[#FF8C00]">Checklist Items ({items.length})</CardTitle>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black h-8 sm:h-9 text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-[#FF8C00]/50">
                  <p className="text-xs sm:text-sm">No checklist items yet</p>
                  <p className="text-xs text-slate-400 dark:text-[#FF8C00]/30 mt-1">
                    Use AI generation above or add items manually
                  </p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-blue-900/30 rounded-lg">
                    <div className="flex-1">
                      <Input
                        value={item.text}
                        onChange={(e) => updateItem(index, 'text', e.target.value)}
                        placeholder="Enter checklist item"
                        className="border-slate-300 dark:border-blue-900/30 dark:bg-[#0a0e17] dark:text-[#FF8C00]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-slate-600 dark:text-[#FF8C00]/70">Required</Label>
                      <Checkbox
                        checked={item.required}
                        onCheckedChange={(checked) => updateItem(index, 'required', checked)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl('Checklists'))}
              className="border-slate-300 dark:border-blue-900/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] hover:opacity-90 text-black"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Checklist'}
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}