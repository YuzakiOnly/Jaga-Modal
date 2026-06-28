// resources/js/components/ui/date-range-picker.jsx
import { useState, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    format,
    subDays,
    subYears,
    startOfMonth,
    startOfWeek,
    startOfYear,
} from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

const QUICK_PERIODS = [
    {
        label: "Hari Ini",
        getRange: () => {
            const today = new Date();
            return { from: today, to: today };
        },
    },
    {
        label: "Kemarin",
        getRange: () => {
            const yesterday = subDays(new Date(), 1);
            return { from: yesterday, to: yesterday };
        },
    },
    {
        label: "Minggu Ini",
        getRange: () => {
            const today = new Date();
            return {
                from: startOfWeek(today, { weekStartsOn: 1 }),
                to: today,
            };
        },
    },
    {
        label: "Bulan Ini",
        getRange: () => {
            const today = new Date();
            return {
                from: startOfMonth(today),
                to: today,
            };
        },
    },
    {
        label: "Tahun Ini",
        getRange: () => {
            const today = new Date();
            return {
                from: startOfYear(today),
                to: today,
            };
        },
    },
    {
        label: "2 Tahun Lalu",
        getRange: () => {
            const today = new Date();
            return {
                from: subYears(today, 2),
                to: today,
            };
        },
    },
    {
        label: "3 Tahun Lalu",
        getRange: () => {
            const today = new Date();
            return {
                from: subYears(today, 3),
                to: today,
            };
        },
    },
    {
        label: "4 Tahun Lalu",
        getRange: () => {
            const today = new Date();
            return {
                from: subYears(today, 4),
                to: today,
            };
        },
    },
];

export function DatePicker({
    onChange,
    className,
    initialDate,
    placeholder = "Pilih tanggal",
    align = "center", // Tambahkan prop align
    sideOffset = 8, // Tambahkan prop sideOffset
}) {
    const [date, setDate] = useState(() => {
        if (initialDate?.from && initialDate?.to) {
            return {
                from: new Date(initialDate.from),
                to: new Date(initialDate.to),
            };
        }
        const today = new Date();
        return {
            from: today,
            to: today,
        };
    });
    const [isOpen, setIsOpen] = useState(false);
    const [tempDate, setTempDate] = useState(date);

    useEffect(() => {
        if (initialDate?.from && initialDate?.to) {
            const newDate = {
                from: new Date(initialDate.from),
                to: new Date(initialDate.to),
            };
            setDate(newDate);
            setTempDate(newDate);
        }
    }, [initialDate]);

    const getDateLabel = () => {
        if (!date.from) return placeholder;
        if (!date.to) return format(date.from, "dd MMM yyyy", { locale: id });
        if (date.from.toDateString() === date.to.toDateString()) {
            return format(date.from, "dd MMM yyyy", { locale: id });
        }

        for (const period of QUICK_PERIODS) {
            const range = period.getRange();
            if (
                date.from.toDateString() === range.from.toDateString() &&
                date.to.toDateString() === range.to.toDateString()
            ) {
                return period.label;
            }
        }

        return `${format(date.from, "dd MMM", { locale: id })} - ${format(date.to, "dd MMM yyyy", { locale: id })}`;
    };

    const handleQuickPeriod = (period) => {
        const range = period.getRange();
        setDate(range);
        setTempDate(range);
        if (onChange) onChange(range);
        setIsOpen(false);
    };

    const handleApply = () => {
        setDate(tempDate);
        if (onChange) onChange(tempDate);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setTempDate(date);
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "justify-start text-left font-normal h-9 text-sm px-3 gap-2",
                        !date.from && "text-muted-foreground",
                        className,
                    )}
                >
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                        {getDateLabel()}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0"
                align={align}
                sideOffset={sideOffset}
                side="bottom"
            >
                <div className="flex flex-col sm:flex-row">
                    <div className="p-3 border-b sm:border-b-0 sm:border-r min-w-[140px]">
                        <div className="flex flex-col gap-1">
                            {QUICK_PERIODS.map((period) => {
                                const range = period.getRange();
                                const isActive =
                                    date.from &&
                                    date.to &&
                                    date.from.toDateString() ===
                                        range.from.toDateString() &&
                                    date.to.toDateString() ===
                                        range.to.toDateString();

                                return (
                                    <Button
                                        key={period.label}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleQuickPeriod(period)
                                        }
                                        className={cn(
                                            "h-7 text-xs justify-start px-2 w-full",
                                            isActive &&
                                                "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                                        )}
                                    >
                                        {period.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <CalendarComponent
                            mode="range"
                            selected={tempDate}
                            onSelect={setTempDate}
                            numberOfMonths={1}
                            locale={id}
                            className="rounded-md border-0"
                            initialFocus
                        />
                        <div className="flex items-center justify-end gap-2 p-3 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                className="h-8 text-xs"
                            >
                                Batal
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleApply}
                                className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
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
