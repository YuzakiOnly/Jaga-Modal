// resources/js/pages/cashier/expenses/_components/ExpenseList.jsx
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
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl py-20 flex flex-col items-center gap-4 text-slate-300">
                <div className="w-24 h-24 rounded-3xl bg-rose-50 flex items-center justify-center">
                    <Receipt
                        size={40}
                        strokeWidth={1.5}
                        className="text-rose-400"
                    />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-slate-600">
                        Belum Ada Pengeluaran
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">
                        Tambahkan pengeluaran untuk tanggal ini
                    </p>
                </div>
                <button
                    onClick={onAddClick}
                    className="mt-2 flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-500 transition-colors shadow-sm shadow-rose-200"
                >
                    <Plus size={16} />
                    Tambah Sekarang
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-medium">
                    Menampilkan {pagination?.from || 0} - {pagination?.to || 0}{" "}
                    dari {pagination?.total || 0} pengeluaran
                </span>
            </div>

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
                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                                link.active
                                    ? "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-200"
                                    : "text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300"
                            } ${!link.url ? "opacity-40 cursor-not-allowed" : ""}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
