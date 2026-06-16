// components/ui/date-range-picker.jsx
"use client";

import { useState } from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import {
    endOfMonth,
    startOfMonth,
    subDays,
    subMonths,
    startOfWeek,
    endOfWeek,
    subWeeks,
    subYears,
    startOfYear,
    endOfYear,
    format,
} from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function formatDate(date) {
    if (!date) return "";
    return format(date, "dd MMM yyyy", { locale: id });
}

export function DateRangePicker({ value, onChange, className }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(today);
    const [tempRange, setTempRange] = useState(value?.range);
    const [tempComparison, setTempComparison] = useState(
        value?.comparison || "last_7_days",
    );

    const presetGroups = [
        {
            label: "Hari",
            presets: [{ label: "Hari Ini", range: { from: today, to: today } }],
        },
        {
            label: "Minggu",
            presets: [
                {
                    label: "Minggu Ini",
                    range: {
                        from: startOfWeek(today, { weekStartsOn: 1 }),
                        to: today,
                    },
                },
            ],
        },
        {
            label: "Bulan",
            presets: [
                {
                    label: "Bulan Ini",
                    range: { from: startOfMonth(today), to: today },
                },
            ],
        },
        {
            label: "Tahun",
            presets: [
                {
                    label: "Tahun Ini",
                    range: { from: startOfYear(today), to: today },
                },
            ],
        },
    ];

    const comparisonOptions = [
        {
            key: "yesterday",
            label: "Kemarin",
            getRange: () => ({
                from: subDays(today, 1),
                to: subDays(today, 1),
            }),
        },
        {
            key: "last_7_days",
            label: "7 Hari Lalu",
            getRange: () => ({
                from: subDays(today, 7),
                to: subDays(today, 1),
            }),
        },
        {
            key: "last_30_days",
            label: "30 Hari Lalu",
            getRange: () => ({
                from: subDays(today, 30),
                to: subDays(today, 1),
            }),
        },
        {
            key: "last_year",
            label: "1 Tahun Lalu",
            getRange: () => ({
                from: startOfYear(subYears(today, 1)),
                to: endOfYear(subYears(today, 1)),
            }),
        },
    ];

    const isPresetActive = (presetRange) => {
        if (!tempRange?.from) return false;
        return (
            tempRange.from.toDateString() === presetRange.from.toDateString() &&
            tempRange.to.toDateString() === presetRange.to.toDateString()
        );
    };

    const handlePresetClick = (range) => {
        setTempRange(range);
        setMonth(range.to ?? range.from ?? today);
    };

    const handleApply = () => {
        if (tempRange?.from) {
            onChange({
                range: tempRange,
                comparison: tempComparison,
            });
        }
        setOpen(false);
    };

    const handleCancel = () => {
        setTempRange(value?.range);
        setTempComparison(value?.comparison || "last_7_days");
        setOpen(false);
    };

    const handleCalendarSelect = (newRange) => {
        if (newRange) {
            if (newRange?.to && newRange.to > today) return;
            if (newRange?.from && newRange.from > today) return;
            setTempRange(newRange);
        }
    };

    const getLabel = () => {
        if (!value?.range?.from) return "Pilih tanggal";
        if (value.range.from && value.range.to) {
            if (
                format(value.range.from, "yyyy-MM-dd") ===
                format(value.range.to, "yyyy-MM-dd")
            ) {
                return formatDate(value.range.from);
            }
            return `${formatDate(value.range.from)} - ${formatDate(value.range.to)}`;
        }
        return formatDate(value.range.from);
    };

    const getComparisonLabel = () => {
        const found = comparisonOptions.find(
            (opt) => opt.key === value?.comparison,
        );
        return found ? found.label : "7 Hari Lalu";
    };

    const disabledDays = { after: today };
    const isSameAsOriginal = () => {
        if (!value?.range?.from && !tempRange?.from) return true;
        if (!value?.range?.from || !tempRange?.from) return false;
        return (
            value.range.from.toDateString() === tempRange.from.toDateString() &&
            value.range.to?.toDateString() === tempRange.to?.toDateString() &&
            value.comparison === tempComparison
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "justify-start text-left font-normal gap-2 min-w-[360px] h-10",
                        !value?.range && "text-muted-foreground",
                        className,
                    )}
                >
                    <CalendarIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">
                        {getLabel()} · Bandingkan: {getComparisonLabel()}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 ml-auto" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                    <div className="w-[220px] border-r">
                        <ScrollArea className="h-[480px]">
                            <div className="flex flex-col gap-3 px-2 py-3">
                                {presetGroups.map((group) => (
                                    <div key={group.label}>
                                        <p className="text-muted-foreground mb-2 px-1 text-[10px] font-semibold tracking-widest uppercase">
                                            {group.label}
                                        </p>
                                        <div className="grid grid-cols-1 gap-1">
                                            {group.presets.map((preset) => (
                                                <Button
                                                    key={preset.label}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "h-8 justify-start text-xs font-normal px-2",
                                                        isPresetActive(
                                                            preset.range,
                                                        )
                                                            ? "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                                                            : "hover:bg-muted",
                                                    )}
                                                    onClick={() =>
                                                        handlePresetClick(
                                                            preset.range,
                                                        )
                                                    }
                                                >
                                                    {preset.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-2 border-t">
                                    <p className="text-muted-foreground mb-2 px-1 text-[10px] font-semibold tracking-widest uppercase">
                                        Bandingkan
                                    </p>
                                    <div className="grid grid-cols-1 gap-1">
                                        {comparisonOptions.map((option) => (
                                            <Button
                                                key={option.key}
                                                variant="ghost"
                                                size="sm"
                                                className={cn(
                                                    "h-8 justify-start text-xs font-normal px-2",
                                                    tempComparison ===
                                                        option.key
                                                        ? "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                                                        : "hover:bg-muted",
                                                )}
                                                onClick={() =>
                                                    setTempComparison(
                                                        option.key,
                                                    )
                                                }
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>

                    <div className="p-3">
                        <Calendar
                            mode="range"
                            selected={tempRange}
                            onSelect={handleCalendarSelect}
                            month={month}
                            onMonthChange={setMonth}
                            numberOfMonths={1}
                            locale={id}
                            className="rounded-md bg-transparent"
                            disabled={disabledDays}
                        />
                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                            >
                                Batal
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleApply}
                                disabled={isSameAsOriginal()}
                            >
                                Terapkan
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
