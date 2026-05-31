import { Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

export default function ExpenseHeader({ date, onDateChange, onAddClick }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-auto justify-start gap-1 sm:gap-2 border-slate-200 hover:border-emerald-300 px-2 sm:px-3 py-1.5 sm:py-2"
                    >
                        <Calendar size={13} className="text-slate-400" />
                        <span className="text-xs sm:text-sm">
                            {format(date, "dd MMM yyyy", { locale: id })}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => newDate && onDateChange(newDate)}
                        disabled={(date) => date > new Date()}
                        locale={id}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            <button
                onClick={onAddClick}
                className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-sm shadow-emerald-200 whitespace-nowrap"
            >
                <Plus size={14} />
                <span className="hidden sm:inline">Tambah Pengeluaran</span>
                <span className="sm:hidden">Tambah</span>
            </button>
        </div>
    );
}
