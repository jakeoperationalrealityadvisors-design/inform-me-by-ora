import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import RoleGuard from "@/components/auth/RoleGuard";
import { sampleData } from "../sampleData";

export default function ManageDailyTasks() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <ManageDailyTasksContent />
    </RoleGuard>
  );
}

function ManageDailyTasksContent() {
  const [tasks, setTasks] = useState(sampleData.documents || []);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", category: "" });
    setEditingTask(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id ? { ...t, ...formData } : t
        )
      );
    } else {
      setTasks((prev) => [
        ...prev,
        {
          id: `task-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          category: formData.category,
        },
      ]);
    }

    setOpen(false);
    resetForm();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      category: task.category || "",
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0e17]">
      {/* HEADER */}
      <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">
                Manage Daily Tasks
              </h1>
              <p className="text-sm text-blue-400">
                Offline sample checklist editor
              </p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Add Task"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600">
                    {editingTask ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* TASK LIST */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#0f1419] border border-blue-900/20 rounded-xl p-4 flex justify-between"
          >
            <div>
              <h3 className="text-white font-semibold">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-blue-300 mt-1">
                  {task.description}
                </p>
              )}
              {task.category && (
                <span className="inline-block mt-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {task.category}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(task)}
              >
                <Edit2 />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(task.id)}
                className="text-red-400"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center text-blue-400 py-12">
            No tasks yet — click “Add Task”
          </div>
        )}
      </div>
    </div>
  );
}
