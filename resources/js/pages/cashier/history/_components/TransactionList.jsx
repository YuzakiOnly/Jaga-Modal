// resources/js/pages/cashier/history/_components/TransactionList.jsx
import { Link } from "@inertiajs/react";
import { Receipt, Package, TrendingUp, Sparkles } from "lucide-react";
import { useState } from "react";
import TransactionItem from "./TransactionItem";

export default function TransactionList({ transactions, fmt }) {
    const [openId, setOpenId] = useState(null);

    if (transactions.data.length === 0) {
        return (
            <div className="bg-white rounded-2xl py-20 flex flex-col items-center gap-4 text-slate-300">
                <div className="w-24 h-24 rounded-3xl bg-orange-50 flex items-center justify-center">
                    <Receipt
                        size={40}
                        strokeWidth={1.5}
                        className="text-orange-400"
                    />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-slate-600">
                        Belum Ada Transaksi
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto">
                        Ubah filter periode atau tanggal untuk melihat transaksi
                        yang tersedia
                    </p>
                </div>
            </div>
        );
    }

    const totalItems = transactions.data.reduce(
        (sum, trx) =>
            sum + (trx.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0),
        0,
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-orange-50 rounded-lg">
                        <Package className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                        <span className="text-sm font-semibold text-slate-700">
                            {transactions.from || 0} - {transactions.to || 0}
                        </span>
                        <span className="text-sm text-slate-400"> dari </span>
                        <span className="text-sm font-semibold text-slate-700">
                            {transactions.total || 0}
                        </span>
                        <span className="text-sm text-slate-400">
                            {" "}
                            transaksi
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {totalItems} item
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                {transactions.data.map((trx) => (
                    <TransactionItem
                        key={trx.id}
                        transaction={trx}
                        isOpen={openId === trx.id}
                        onToggle={() =>
                            setOpenId(openId === trx.id ? null : trx.id)
                        }
                    />
                ))}
            </div>

            {transactions.links && transactions.links.length > 3 && (
                <div className="flex justify-center pt-4 border-t border-slate-100">
                    <div className="flex gap-1.5 flex-wrap justify-center">
                        {transactions.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || "#"}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                                    link.active
                                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
                                        : "text-slate-600 bg-white border border-slate-200 hover:bg-orange-50 hover:border-orange-300"
                                } ${!link.url ? "opacity-40 cursor-not-allowed" : ""}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
