import React from 'react';
import { Folder, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FolderCard({ folder, onClick }) {
    return (
        <motion.button
            whileHover={{ y: -2 }}
            onClick={onClick}
            className="w-full bg-white rounded-lg border border-slate-200 p-4 hover:shadow-lg transition-all text-left group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: folder.color || '#f59e0b20' }}
                    >
                        <Folder 
                            className="w-6 h-6" 
                            style={{ color: folder.color || '#f59e0b' }}
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-[#1e90ff] transition-colors">
                            {folder.name}
                        </h3>
                        {folder.description && (
                            <p className="text-sm text-slate-600 line-clamp-1">{folder.description}</p>
                        )}
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#1e90ff] group-hover:translate-x-1 transition-all" />
            </div>
        </motion.button>
    );
}