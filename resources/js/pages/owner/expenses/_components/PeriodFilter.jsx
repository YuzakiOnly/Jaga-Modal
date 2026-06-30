import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { DatePicker } from "@/components/date-range-picker";
import { format } from "date-fns";

export function PeriodFilter({ filters }) {
    const dateFrom = filters?.date_from;
    const dateTo = filters?.date_to;

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

            router.get(
                route("owner.expenses"),
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
                initialDate={initialDate}
                align="start"
                sideOffset={8}
            />
        </div>
    );
}
