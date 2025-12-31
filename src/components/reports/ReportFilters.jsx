import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportFilters({ 
    dateRange, 
    setDateRange, 
    category, 
    setCategory, 
    status, 
    setStatus,
    categories = [],
    onExport
}) {
    return (
        <Card className="bg-white dark:bg-[#0f1419] border-slate-200 dark:border-slate-800 transition-colors">
            <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Date Range</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left dark:bg-[#0a0e17] dark:border-slate-700">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "MMM dd, yyyy")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 dark:bg-[#0f1419] dark:border-slate-700">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="dark:bg-[#0a0e17] dark:border-slate-700">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-[#0f1419] dark:border-slate-700">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="dark:bg-[#0a0e17] dark:border-slate-700">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-[#0f1419] dark:border-slate-700">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Export Button */}
                <Button 
                    onClick={onExport}
                    className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E90FF] hover:opacity-90"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </CardContent>
        </Card>
    );
}