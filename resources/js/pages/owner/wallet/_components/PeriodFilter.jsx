import { Calendar, ChevronDown } from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";

const PERIODS = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
];

export function PeriodFilter({ filters }) {
    const currentPeriod = filters?.period || "monthly";
    const currentDate = filters?.date || new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(
        currentDate ? new Date(currentDate) : new Date(),
    );

    const currentPeriodLabel =
        PERIODS.find((p) => p.value === currentPeriod)?.label || "Bulanan";

    const handlePeriodChange = (period) => {
        router.get(
            route("owner.wallet"),
            { period, date: format(date, "yyyy-MM-dd") },
            { preserveState: true },
        );
    };

    const handleDateChange = (newDate) => {
        if (newDate) {
            setDate(newDate);
            router.get(
                route("owner.wallet"),
                { period: currentPeriod, date: format(newDate, "yyyy-MM-dd") },
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
                        className="gap-1.5 sm:gap-2 h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
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
                            className="text-sm"
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
                        className="justify-start text-left font-normal h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 gap-1.5 sm:gap-2"
                    >
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        {date ? (
                            format(date, "PPP", { locale: id })
                        ) : (
                            <span>Pilih tanggal</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                        locale={id}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
