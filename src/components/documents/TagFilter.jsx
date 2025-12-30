import React from 'react';
import { Filter, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TagFilter({ tags, selected, onSelect }) {
    const toggleTag = (tagName) => {
        if (selected.includes(tagName)) {
            onSelect(selected.filter(t => t !== tagName));
        } else {
            onSelect([...selected, tagName]);
        }
    };

    const clearAll = () => {
        onSelect([]);
    };

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Tags
                        {selected.length > 0 && (
                            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                                {selected.length}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    {tags.map(tag => (
                        <DropdownMenuItem 
                            key={tag.id}
                            onClick={() => toggleTag(tag.name)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span>{tag.name}</span>
                                {selected.includes(tag.name) && (
                                    <div className="w-2 h-2 rounded-full bg-[#1e90ff]" />
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {selected.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1">
                    <X className="w-3 h-3" />
                    Clear
                </Button>
            )}
        </div>
    );
}