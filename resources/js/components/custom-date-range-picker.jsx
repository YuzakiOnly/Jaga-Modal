import { useState, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function CustomDateRangePicker({ onChange, className }) {
    const [date, setDate] = useState({
        from: new Date(),
        to: new Date(),
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (onChange) {
            onChange(date);
        }
    }, [date, onChange]);

    const getDateLabel = () => {
        if (!date.from) return "Pilih tanggal";
        if (!date.to) return format(date.from, "dd MMM yyyy", { locale: id });
        if (date.from.toDateString() === date.to.toDateString()) {
            return format(date.from, "dd MMM yyyy", { locale: id });
        }
        return `${format(date.from, "dd MMM", { locale: id })} - ${format(date.to, "dd MMM yyyy", { locale: id })}`;
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "justify-start text-left font-normal",
                        !date.from && "text-muted-foreground",
                        className,
                    )}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {getDateLabel()}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                    mode="range"
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    locale={id}
                    className="rounded-md border"
                />
            </PopoverContent>
        </Popover>
    );
}
