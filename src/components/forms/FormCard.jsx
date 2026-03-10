import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Share2, ChevronDown, ChevronRight, Edit } from 'lucide-react';
import ShareFormDialog from './ShareFormDialog';
import { useUserRole } from '@/components/auth/RoleGuard';

export default function FormCard({ form, category, viewMode = 'list' }) {
    const [shareOpen, setShareOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const { canCreateForms } = useUserRole();
    const fieldCount = form.fields?.length || 0;

    return (
        <>
            <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
                {/* Main row */}
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(v => !v)}>
                        <p className="text-sm font-semibold text-white truncate">{form.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {category && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white/5 text-white/40"
                                    style={category.color ? { backgroundColor: category.color + '22', color: category.color } : {}}>
                                    {category.name}
                                </span>
                            )}
                            <span className="text-[10px] text-white/30">{fieldCount} fields</span>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => setShareOpen(true)}
                            title="Share"
                            className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                        </button>
                        {canCreateForms && (
                            <Link to={createPageUrl(`EditForm?id=${form.id}`)}>
                                <button title="Edit" className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                                    <Edit className="w-3.5 h-3.5" />
                                </button>
                            </Link>
                        )}
                        <Link to={createPageUrl(`FillForm?id=${form.id}`)}>
                            <button className="ml-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors">
                                Fill
                            </button>
                        </Link>
                        <button onClick={() => setExpanded(v => !v)} className="p-1 text-white/20 hover:text-white/50 transition-colors ml-0.5">
                            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {/* Expanded description */}
                {expanded && form.description && (
                    <div className="px-4 pb-3 pt-1 border-t border-white/5">
                        <p className="text-xs text-white/40 leading-relaxed">{form.description}</p>
                    </div>
                )}
            </div>

            <ShareFormDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                formId={form.id}
                formTitle={form.title}
                type="form"
            />
        </>
    );
}