import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckSquare, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function ChecklistCard({ checklist, category }) {
    const [shareOpen, setShareOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const itemCount = checklist.items?.length || 0;
    
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="bg-[#0f1419] border border-blue-900/20 rounded-lg hover:border-blue-700/50 transition-all">
                <div className="flex items-center gap-3 p-3">
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left group">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <ChevronRight className="w-4 h-4 text-blue-400" />}
                        <CheckSquare className="w-4 h-4 text-[#FF8C00]" />
                        <span className="font-medium text-white group-hover:text-[#FF8C00] transition-colors">{checklist.title}</span>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                        {category && <span className="px-2 py-0.5 bg-blue-900/30 rounded">{category.name}</span>}
                        <span>{itemCount} items</span>
                    </div>
                    <Link to={createPageUrl(`FillChecklist?id=${checklist.id}`)}>
                        <button className="px-3 py-1 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black text-xs font-medium rounded hover:opacity-90">
                            Fill
                        </button>
                    </Link>
                </div>
                <CollapsibleContent>
                    <div className="px-3 pb-3 pt-1 text-sm text-blue-400/70 border-t border-blue-900/20 mt-2">
                        {checklist.description || 'No description'}
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}