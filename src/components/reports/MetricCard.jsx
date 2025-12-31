import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, icon: Icon, trend, trendValue, color = "blue" }) {
    const colorClasses = {
        blue: 'text-blue-500 bg-blue-500/10',
        orange: 'text-orange-500 bg-orange-500/10',
        green: 'text-green-500 bg-green-500/10',
        red: 'text-red-500 bg-red-500/10',
        purple: 'text-purple-500 bg-purple-500/10'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="bg-white dark:bg-[#0f1419] border-slate-200 dark:border-slate-800 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2 text-xs">
                            {trend === 'up' ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                                {trendValue}%
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">vs last period</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}