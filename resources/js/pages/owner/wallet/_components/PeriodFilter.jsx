// PeriodFilter.jsx
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { DatePicker } from "@/components/date-range-picker";
import { format } from "date-fns";
import { useState } from "react";

export function PeriodFilter({ filters }) {
    const dateFrom = filters?.date_from;
    const dateTo = filters?.date_to;

    const [selectedDate, setSelectedDate] = useState(() => {
        if (dateFrom && dateTo) {
            return {
                from: new Date(dateFrom),
                to: new Date(dateTo),
            };
        }
        const today = new Date();
        return {
            from: today,
            to: today,
        };
    });

    const initialDate =
        dateFrom && dateTo
            ? {
                  from: new Date(dateFrom),
                  to: new Date(dateTo),
              }
            : undefined;

    const handleDateChange = (dateRange) => {
        if (dateRange?.from) {
            const from = dateRange.from;
            const to = dateRange.to || from;

            setSelectedDate({
                from: from,
                to: to,
            });

            router.get(
                route("owner.wallet"),
                {
                    date_from: format(from, "yyyy-MM-dd"),
                    date_to: format(to, "yyyy-MM-dd"),
                },
                { preserveState: true },
            );
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DatePicker
                onChange={handleDateChange}
                initialDate={initialDate || selectedDate}
                align="start"
                sideOffset={8}
            />
        </div>
    );
}
