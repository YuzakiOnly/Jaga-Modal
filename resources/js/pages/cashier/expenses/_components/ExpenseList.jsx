import { Link } from "@inertiajs/react";
import { Receipt, Plus } from "lucide-react";
import ExpenseCard from "./ExpenseCard";

export default function ExpenseList({
    expenses,
    onAddClick,
    onEdit,
    fmt,
    pagination,
}) {
    if (expenses.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 py-16 sm:py-20 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Receipt
                        size={28}
                        strokeWidth={1.5}
                        className="text-slate-300"
                    />
                </div>
                <p className="text-sm font-semibold text-slate-400">
                    Belum ada pengeluaran
                </p>
                <p className="text-xs text-slate-400 text-center px-4">
                    Tambahkan pengeluaran untuk tanggal ini
                </p>
                <button
                    onClick={onAddClick}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-colors"
                >
                    <Plus size={13} />
                    Tambah Sekarang
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {expenses.map((expense) => (
                <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    fmt={fmt}
                    onEdit={onEdit}
                />
            ))}

            {pagination?.links && pagination.links.length > 3 && (
                <div className="flex justify-center gap-1.5 py-4 flex-wrap">
                    {pagination.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || "#"}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 sm:px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
                                link.active
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                            } ${!link.url ? "opacity-30 pointer-events-none" : ""}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
