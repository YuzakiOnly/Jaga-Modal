import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function TransactionFilter({
    period,
    date,
    onPeriodChange,
    onDateChange,
}) {
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

            <Input
                type="date"
                value={date}
                onChange={onDateChange}
                className="w-44"
            />
        </div>
    );
}
