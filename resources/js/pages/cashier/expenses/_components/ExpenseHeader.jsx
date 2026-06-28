// resources/js/pages/cashier/expenses/_components/ExpenseHeader.jsx
import { Calendar, Plus, Filter } from "lucide-react";
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
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-xl">
                    <Filter className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-700">
                        Filter Pengeluaran
                    </h3>
                    <p className="text-xs text-slate-400">
                        Pilih tanggal pengeluaran
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 px-4 py-2 rounded-xl"
                        >
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-700">
                                {format(date, "dd MMM yyyy", { locale: id })}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={(newDate) =>
                                newDate && onDateChange(newDate)
                            }
                            disabled={(date) => date > new Date()}
                            locale={id}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <button
                    onClick={onAddClick}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-500 active:scale-[0.98] transition-all shadow-sm shadow-rose-200 whitespace-nowrap"
                >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Tambah Pengeluaran</span>
                    <span className="sm:hidden">Tambah</span>
                </button>
            </div>
        </div>
    );
}
