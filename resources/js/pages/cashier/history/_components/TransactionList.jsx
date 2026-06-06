import { Link } from "@inertiajs/react";
import { Receipt } from "lucide-react";
import { useState } from "react";
import TransactionItem from "./TransactionItem";

export default function TransactionList({ transactions, fmt }) {
    const [openId, setOpenId] = useState(null);

    if (transactions.data.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 py-20 flex flex-col items-center gap-3 text-slate-300">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Receipt
                        size={28}
                        strokeWidth={1.5}
                        className="text-slate-300"
                    />
                </div>
                <p className="text-sm font-semibold text-slate-400">
                    Belum ada transaksi
                </p>
                <p className="text-xs text-slate-400 text-center px-4">
                    Coba ubah filter periode atau tanggal
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {transactions.data.map((trx) => (
                <TransactionItem
                    key={trx.id}
                    transaction={trx}
                    isOpen={openId === trx.id}
                    onToggle={() =>
                        setOpenId(openId === trx.id ? null : trx.id)
                    }
                    fmt={fmt}
                />
            ))}

            {transactions.links && transactions.links.length > 3 && (
                <div className="flex justify-center gap-1.5 py-4 flex-wrap">
                    {transactions.links.map((link, i) => (
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
