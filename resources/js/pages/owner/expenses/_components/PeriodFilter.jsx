import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PERIODS = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
];

export function PeriodFilter({ filters }) {
    const currentPeriod = filters?.period || "daily";
    const currentDate = filters?.date || new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(new Date(currentDate));

    const currentPeriodLabel =
        PERIODS.find((p) => p.value === currentPeriod)?.label || "Harian";

    const handlePeriodChange = (period) => {
        const formattedDate = format(date, "yyyy-MM-dd");
        router.get(
            route("owner.expenses"),
            { period, date: formattedDate },
            { preserveState: true },
        );
    };

    const handleDateSelect = (newDate) => {
        if (newDate) {
            setDate(newDate);
            const formattedDate = format(newDate, "yyyy-MM-dd");
            router.get(
                route("owner.expenses"),
                { period: currentPeriod, date: formattedDate },
                { preserveState: true },
            );
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 sm:gap-2"
                    >
                        {currentPeriodLabel}
                        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {PERIODS.map((period) => (
                        <DropdownMenuItem
                            key={period.value}
                            onClick={() => handlePeriodChange(period.value)}
                        >
                            {period.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "gap-1.5 sm:gap-2",
                            !date && "text-muted-foreground",
                        )}
                    >
                        <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>
                            {date
                                ? format(date, "dd MMM yyyy", { locale: id })
                                : "Pilih tanggal"}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(date) => date > new Date()}
                        locale={id}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
