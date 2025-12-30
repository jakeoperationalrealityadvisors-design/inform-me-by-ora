import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FormCard({ form, category }) {
    const fieldCount = form.fields?.length || 0;
    
    return (
        <Link 
            to={createPageUrl(`FillForm?id=${form.id}`)}
            className="block"
        >
            <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-lg border-2 border-slate-300 shadow-lg hover:shadow-xl transition-all overflow-hidden"
            >
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-3">
                    <h3 className="font-bold text-white text-lg uppercase tracking-wide">
                        {form.title}
                    </h3>
                </div>
                
                {/* Content */}
                <div className="p-6">
                    {form.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {form.description}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 text-slate-500">
                            <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                {fieldCount} field{fieldCount !== 1 ? 's' : ''}
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