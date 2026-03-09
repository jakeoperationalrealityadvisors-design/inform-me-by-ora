import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

const folderColors = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'
];

export default function FolderDialog({ open, onOpenChange, currentFolderId }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(folderColors[0]);

    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Folder.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['folders']);
            toast.success('Folder created');
            handleClose();
        }
    });

    const handleSubmit = () => {
        if (!name) {
            toast.error('Please provide a folder name');
            return;
        }

        createMutation.mutate({
            name,
            description,
            color,
            parent_folder_id: currentFolderId
        });
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        setColor(folderColors[0]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Folder Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter folder name"
                        />
                    </div>

                    <div>
                        <Label>Description (optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Color</Label>
                        <div className="flex gap-2 mt-2">
                            {folderColors.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-all ${
                                        color === c ? 'ring-2 ring-offset-2 ring-[#1e90ff]' : ''
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={!name}
                        className="bg-gradient-to-r from-[#1e90ff] to-[#0066cc]"
                    >
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Create Folder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}