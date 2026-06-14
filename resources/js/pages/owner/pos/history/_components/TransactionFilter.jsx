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
import { Store, Bike, Zap, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const CHANNEL_OPTIONS = [
    { id: "", label: "Semua", icon: null },
    { id: "dine_in", label: "Dine In", icon: Store, color: "text-slate-600" },
    { id: "grabfood", label: "GrabFood", icon: Bike, color: "text-green-600" },
    {
        id: "shopeefood",
        label: "ShopeeFood",
        icon: Bike,
        color: "text-orange-500",
    },
    { id: "gobiz", label: "GoBiz", icon: Zap, color: "text-emerald-600" },
];

export function TransactionFilter({
    period,
    date,
    channel = "",
    onPeriodChange,
    onDateChange,
    onChannelChange,
}) {
    const selectedDate = date ? parseISO(date) : new Date();

    const handleDateSelect = (picked) => {
        if (!picked) return;
        const formatted = format(picked, "yyyy-MM-dd");
        onDateChange({ target: { value: formatted } });
    };

    return (
        <div className="space-y-3">
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

            {onChannelChange && (
                <div className="flex flex-wrap gap-2">
                    {CHANNEL_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = channel === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => onChannelChange(opt.id)}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-muted-foreground border-border hover:bg-accent",
                                )}
                            >
                                {Icon && (
                                    <Icon
                                        className={cn(
                                            "h-3 w-3",
                                            isActive
                                                ? "text-primary-foreground"
                                                : opt.color,
                                        )}
                                    />
                                )}
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
