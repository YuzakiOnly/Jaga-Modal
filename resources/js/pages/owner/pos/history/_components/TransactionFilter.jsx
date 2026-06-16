import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function TransactionFilter({
    period,
    date,
    onPeriodChange,
    onDateChange,
}) {
    const selectedDate = date ? parseISO(date) : new Date();

    const handleDateSelect = (picked) => {
        if (!picked) return;
        const formatted = format(picked, "yyyy-MM-dd");
        onDateChange({ target: { value: formatted } });
    };

    return (
        <div className="flex flex-wrap gap-3 items-center">
            <Select value={period} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-36">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                </SelectContent>
            </Select>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-44 justify-start text-left font-normal",
                            !date && "text-muted-foreground",
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date
                            ? format(selectedDate, "dd MMM yyyy", {
                                  locale: id,
                              })
                            : "Pilih tanggal"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        locale={id}
                        disabled={{ after: new Date() }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
