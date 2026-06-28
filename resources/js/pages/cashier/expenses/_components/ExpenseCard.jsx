// resources/js/pages/cashier/expenses/_components/ExpenseCard.jsx
import {
    Package,
    Users,
    FileText,
    Wallet,
    ChevronDown,
    ChevronUp,
    Pencil,
    Clock,
} from "lucide-react";
import { useState } from "react";

const getTypeIcon = (type) => {
    switch (type) {
        case "raw_material":
            return <Package size={18} className="text-blue-500" />;
        case "salary":
            return <Users size={18} className="text-green-500" />;
        case "owner_withdrawal":
            return <Wallet size={18} className="text-purple-500" />;
        default:
            return <FileText size={18} className="text-gray-500" />;
    }
};

const getTypeLabel = (type) => {
    switch (type) {
        case "raw_material":
            return "Bahan Baku";
        case "salary":
            return "Gaji";
        case "owner_withdrawal":
            return "Penarikan Owner";
        default:
            return "Pengeluaran";
    }
};

const getTypeColor = (type) => {
    switch (type) {
        case "owner_withdrawal":
            return "bg-purple-100 text-purple-700";
        case "salary":
            return "bg-green-100 text-green-700";
        case "raw_material":
            return "bg-blue-100 text-blue-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getTypeBorder = (type) => {
    switch (type) {
        case "owner_withdrawal":
            return "border-purple-200";
        case "salary":
            return "border-green-200";
        case "raw_material":
            return "border-blue-200";
        default:
            return "border-gray-200";
    }
};

const getDetailText = (expense, fmt) => {
    if (
        expense.type === "raw_material" &&
        expense.quantity &&
        expense.unit_price
    ) {
        const qty = parseFloat(expense.quantity);
        const price = parseFloat(expense.unit_price);
        return `${qty} × ${fmt(price)}`;
    }
    if (expense.type === "salary" && expense.employee_name) {
        return `${expense.employee_name} · ${expense.salary_period}`;
    }
    if (expense.type === "owner_withdrawal") {
        return "Penarikan ke dompet owner";
    }
    return null;
};

const fmtPrice = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function ExpenseCard({ expense, onEdit }) {
    const [showNotes, setShowNotes] = useState(false);
    const isOwnerWithdrawal = expense.type === "owner_withdrawal";

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div
            className={`bg-white rounded-2xl border ${getTypeBorder(expense.type)} overflow-hidden shadow-sm hover:shadow-md transition-all duration-200`}
        >
            <div className="flex items-center justify-between gap-3 p-4">
                <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                >
                    <div
                        className={`w-12 h-12 rounded-2xl ${getTypeColor(expense.type).split(" ")[0]} flex items-center justify-center shrink-0`}
                    >
                        {getTypeIcon(expense.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-800 break-words">
                                {expense.description}
                            </p>
                            <span
                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${getTypeColor(expense.type)}`}
                            >
                                {getTypeLabel(expense.type)}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                            {getDetailText(expense, fmtPrice) && (
                                <span className="text-xs text-slate-500 break-words">
                                    {getDetailText(expense, fmtPrice)}
                                </span>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(
                                        expense.expensed_at ||
                                            expense.created_at,
                                    )}{" "}
                                    ·{" "}
                                    {formatTime(
                                        expense.expensed_at ||
                                            expense.created_at,
                                    )}
                                </span>

                                {expense.notes && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                                        <FileText size={10} />
                                        <span>ada catatan</span>
                                        {showNotes ? (
                                            <ChevronUp size={10} />
                                        ) : (
                                            <ChevronDown size={10} />
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                    <p
                        className={`text-base font-black whitespace-nowrap ${
                            isOwnerWithdrawal
                                ? "text-purple-600"
                                : "text-rose-600"
                        }`}
                    >
                        − {fmtPrice(expense.amount)}
                    </p>

                    <button
                        onClick={() => onEdit(expense)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit pengeluaran"
                    >
                        <Pencil size={16} />
                    </button>
                </div>
            </div>

            {showNotes && expense.notes && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-600 wrap-break-word">
                            <FileText
                                size={10}
                                className="inline mr-1.5 text-slate-400"
                            />
                            {expense.notes}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
