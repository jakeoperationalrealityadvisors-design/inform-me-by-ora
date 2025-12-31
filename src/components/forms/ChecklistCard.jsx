import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChecklistCard({ checklist, category }) {
    const itemCount = checklist.items?.length || 0;
    
    return (
        <Link 
            to={createPageUrl(`FillChecklist?id=${checklist.id}`)}
            className="block"
        >
            <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-lg border-2 border-slate-300 shadow-lg hover:shadow-xl active:scale-98 transition-all overflow-hidden"
            >
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-4 sm:px-6 py-2.5 sm:py-3">
                    <h3 className="font-bold text-white text-base sm:text-lg uppercase tracking-wide">
                        {checklist.title}
                    </h3>
                </div>
                
                {/* Content */}
                <div className="p-4 sm:p-6">
                    {checklist.description && (
                        <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-2">
                            {checklist.description}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 sm:gap-3 text-slate-500">
                            <span className="flex items-center gap-1">
                                <CheckSquare className="w-3.5 h-3.5" />
                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </span>
                            {category && (
                                <>
                                    <span>•</span>
                                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium">
                                        {category.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Footer Accent */}
                <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-300"></div>
            </motion.div>
        </Link>
    );
}