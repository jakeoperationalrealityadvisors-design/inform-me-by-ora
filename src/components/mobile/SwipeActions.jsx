import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit, Check } from 'lucide-react';

export default function SwipeActions({ children, onDelete, onEdit, onComplete, disabled }) {
    const [swipeX, setSwipeX] = useState(0);
    const [swiping, setSwiping] = useState(false);
    const startX = useRef(0);
    const maxSwipe = 150;

    const handleDragStart = () => {
        if (disabled) return;
        setSwiping(true);
    };

    const handleDrag = (event, info) => {
        if (disabled) return;
        const newX = Math.max(Math.min(info.offset.x, maxSwipe), -maxSwipe);
        setSwipeX(newX);
    };

    const handleDragEnd = (event, info) => {
        if (disabled) return;
        setSwiping(false);
        
        if (Math.abs(swipeX) > 80) {
            if (swipeX < 0 && onDelete) {
                onDelete();
            } else if (swipeX > 0 && (onEdit || onComplete)) {
                if (onComplete && swipeX > 80) {
                    onComplete();
                } else if (onEdit) {
                    onEdit();
                }
            }
        }
        
        setSwipeX(0);
    };

    return (
        <div className="relative overflow-hidden rounded-lg">
            {/* Left action */}
            {(onEdit || onComplete) && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <motion.div
                        initial={false}
                        animate={{ opacity: swipeX > 40 ? 1 : 0, scale: swipeX > 40 ? 1 : 0.8 }}
                        className="flex gap-2"
                    >
                        {onComplete && (
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                            </div>
                        )}
                        {onEdit && (
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <Edit className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Right action */}
            {onDelete && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <motion.div
                        initial={false}
                        animate={{ opacity: swipeX < -40 ? 1 : 0, scale: swipeX < -40 ? 1 : 0.8 }}
                    >
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-white" />
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -maxSwipe, right: maxSwipe }}
                dragElastic={0.2}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{ x: swipeX }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative z-10 bg-[#0f1419] dark:bg-slate-900"
            >
                {children}
            </motion.div>
        </div>
    );
}