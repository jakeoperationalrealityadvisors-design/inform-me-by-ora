import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckSquare, ChevronDown, ChevronRight, Share2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ShareFormDialog from './ShareFormDialog';

export default function ChecklistCard({ checklist, category, viewMode = 'list' }) {
    const [shareOpen, setShareOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const itemCount = checklist.items?.length || 0;
    
    if (viewMode === 'grid') {
        return (
            <>
                <div className="bg-[#0f1419] border border-blue-900/20 rounded-lg hover:border-blue-700/50 transition-all p-4 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                        <CheckSquare className="w-5 h-5 text-[#FF8C00] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">{checklist.title}</h3>
                            {category && (
                                <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded inline-block mt-1">
                                    {category.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-sm text-blue-400/70 line-clamp-2 mb-3 flex-1">
                        {checklist.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-blue-900/20">
                        <span className="text-xs text-blue-400">{itemCount} items</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShareOpen(true)}
                                className="p-1.5 text-green-400 hover:bg-green-950/20 rounded transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <Link to={createPageUrl(`FillChecklist?id=${checklist.id}`)}>
                                <button className="px-3 py-1 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-black text-xs font-medium rounded hover:opacity-90">
                                    Fill
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                
                <ShareFormDialog 
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                    formId={checklist.id}
                    formTitle={checklist.title}
                    type="checklist"
                />
            </>
        );
    }
    
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
                    <button 
                        onClick={() => setShareOpen(true)}
                        className="p-2 text-green-400 hover:bg-green-950/20 rounded transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
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
            
            <ShareFormDialog 
                open={shareOpen}
                onOpenChange={setShareOpen}
                formId={checklist.id}
                formTitle={checklist.title}
                type="checklist"
            />
        </Collapsible>
    );
}