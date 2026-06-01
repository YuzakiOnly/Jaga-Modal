import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Store, Bike, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_OPTIONS = [
    { id: "", label: "Semua", icon: null },
    { id: "dine_in", label: "Dine In", icon: Store, color: "text-slate-600" },
    { id: "grabfood", label: "GrabFood", icon: Bike, color: "text-green-600" },
    {
        id: "shopeefood",
        label: "ShopeFood",
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
    return (
        <div className="space-y-3">
            {/* Period & date row */}
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

                <Input
                    type="date"
                    value={date}
                    onChange={onDateChange}
                    className="w-44"
                />
            </div>

            {/* Channel filter pills */}
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
