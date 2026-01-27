import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { ArrowLeft, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { sampleData } from "../sampleData";
import AITaskEnhancer from '@/components/ai/AITaskEnhancer';

export default function CreateTask() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    due_date: "",
    priority: "medium",
    status: "todo",
    category: ""
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const task = await httpClient.entities.Task.create(data);
      
      // Trigger automations
      try {
        await httpClient.functions.invoke('executeAutomations', {
          trigger_type: 'task_created',
          trigger_data: { ...task, category_id: task.category_id }
        });
      } catch (error) {
        console.error('Failed to trigger automations:', error);
        // Don't fail the task creation if automation fails
      }
      
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
      navigate(createPageUrl("Tasks"));
    },
    onError: (error) => {
      toast.error('Failed to create task: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title) return;

    createMutation.mutate({
      ...taskData,
      due_date: taskData.due_date ? new Date(taskData.due_date).toISOString() : null
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      {/* Header */}
      <div className="border-b border-blue-900/30 bg-[#0f1419] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Tasks"))}
            className="text-[#FF8C00]"
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#FF8C00]">
              Create New Task
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          <Card className="bg-[#0f1419] border-blue-900/30">
            <CardHeader>
              <CardTitle className="text-[#FF8C00]">
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={taskData.title}
                  onChange={(e) =>
                    setTaskData({ ...taskData, title: e.target.value })
                  }
                  placeholder="e.g. Complete Pre-Trip Inspection"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={taskData.description}
                  onChange={(e) =>
                    setTaskData({ ...taskData, description: e.target.value })
                  }
                  placeholder="Optional task details"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Assigned To</Label>
                  <Input
                    value={taskData.assigned_to}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        assigned_to: e.target.value
                      })
                    }
                    placeholder="Email or name"
                  />
                </div>

                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={taskData.due_date}
                    onChange={(e) =>
                      setTaskData({ ...taskData, due_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={taskData.priority}
                    onValueChange={(v) =>
                      setTaskData({ ...taskData, priority: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Input
                    value={taskData.category}
                    onChange={(e) =>
                      setTaskData({ ...taskData, category: e.target.value })
                    }
                    placeholder="Safety / Compliance / Maintenance"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Tasks"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Task'}
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
