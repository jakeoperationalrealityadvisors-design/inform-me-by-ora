import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { sampleData } from "../sampleData";

const STORAGE_KEY = "ora_tasks";

export default function CreateTask() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assigned_to_name: "",
    due_date: "",
    priority: "medium",
    status: "todo",
    category: ""
  });

  /* Load tasks from localStorage or sampleData */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      setTasks(sampleData.tasks || []);
    }
  }, []);

  /* Save tasks to localStorage */
  const persistTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title) return;

    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      created_at: new Date().toISOString()
    };

    persistTasks([...tasks, newTask]);
    navigate(createPageUrl("MyTasks"));
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      {/* Header */}
      <div className="border-b border-blue-900/30 bg-[#0f1419] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("MyTasks"))}
            className="text-[#FF8C00]"
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#FF8C00]">
              Create New Task
            </h1>
            <p className="text-sm text-[#FF8C00]/70">
              Offline · Local · Instant
            </p>
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
                    value={taskData.assigned_to_name}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        assigned_to_name: e.target.value
                      })
                    }
                    placeholder="Driver / Admin / Dispatcher"
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
              onClick={() => navigate(createPageUrl("MyTasks"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
