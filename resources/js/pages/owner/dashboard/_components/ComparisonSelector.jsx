import { Calendar, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const COMPARISON_OPTIONS = [
    { value: "yesterday", label: "Kemarin" },
    { value: "last_week", label: "1 Minggu Lalu" },
    { value: "last_month", label: "Bulan Lalu" },
];

export default function ComparisonSelector({ value, onChange }) {
    const currentLabel =
        COMPARISON_OPTIONS.find((opt) => opt.value === value)?.label ||
        "Bulan Lalu";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {currentLabel}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {COMPARISON_OPTIONS.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={value === option.value ? "bg-accent" : ""}
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
