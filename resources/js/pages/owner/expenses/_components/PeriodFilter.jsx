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
import { useState } from "react";

const PERIODS = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
];

export function PeriodFilter({ filters }) {
    const currentPeriod = filters?.period || "daily";
    const currentDate = filters?.date || new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(currentDate);

    const currentPeriodLabel =
        PERIODS.find((p) => p.value === currentPeriod)?.label || "Harian";

    const handlePeriodChange = (period) => {
        router.get(
            route("owner.expenses"),
            { period, date },
            { preserveState: true },
        );
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        router.get(
            route("owner.expenses"),
            { period: currentPeriod, date: newDate },
            { preserveState: true },
        );
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

            <div className="flex items-center gap-2 border rounded-lg px-2.5 sm:px-3 py-1.5 h-9 sm:h-10">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <input
                    type="date"
                    value={date}
                    onChange={handleDateChange}
                    className="text-xs sm:text-sm outline-none bg-transparent min-w-0"
                />
            </div>
        </div>
    );
}
