// resources/js/pages/cashier/expenses/page.jsx
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import CashierLayout from "@/layouts/CashierLayout";
import ExpenseFormModal from "./_components/ExpenseFormModal";
import ExpenseHeader from "./_components/ExpenseHeader";
import ExpenseSummary from "./_components/ExpenseSummary";
import ExpenseList from "./_components/ExpenseList";
import { toast, Toaster } from "sonner";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function Expenses({
    expenses,
    summary,
    filters,
    storeCashBalance,
}) {
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [date, setDate] = useState(
        filters?.date ? new Date(filters.date) : new Date(),
    );

    useSmartRefresh({ ...refreshConfigs.cashier_expenses });

    const expenseList = expenses?.data ?? [];
    const totalExpense = summary?.total ?? 0;

    useEffect(() => {
        const urlDate = new URL(window.location.href).searchParams.get("date");
        if (urlDate && filters?.date !== urlDate) {
            const newDate = new Date(urlDate);
            if (!isNaN(newDate.getTime())) {
                setDate(newDate);
            }
        }
    }, [filters?.date]);

    function handleDateChange(newDate) {
        if (!newDate) return;

        setDate(newDate);

        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, "0");
        const day = String(newDate.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        router.get(
            route("cashier.expenses"),
            { date: formattedDate },
            { preserveState: true, preserveScroll: true },
        );
    }

    function handleModalSuccess() {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        router.get(
            route("cashier.expenses"),
            { date: formattedDate },
            { preserveState: true, preserveScroll: true },
        );
    }

    const handleEdit = (expense) => {
        setEditTarget(expense);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setEditTarget(null);
    };

    return (
        <CashierLayout title="Pengeluaran">
            <Head title="Pengeluaran — JagaModal" />

            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <span className="bg-gradient-to-r from-rose-500 to-red-500 text-transparent bg-clip-text">
                                        Pengeluaran
                                    </span>
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Kelola dan pantau semua pengeluaran toko
                                </p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200/50">
                                <div className="text-center">
                                    <p className="text-xs text-slate-400">
                                        Total
                                    </p>
                                    <p className="text-lg font-bold text-slate-800">
                                        {expenseList.length}
                                    </p>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400">
                                        Pengeluaran
                                    </p>
                                    <p className="text-lg font-bold text-rose-600">
                                        {fmt(totalExpense)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
                            <ExpenseHeader
                                date={date}
                                onDateChange={handleDateChange}
                                onAddClick={() => {
                                    setEditTarget(null);
                                    setShowModal(true);
                                }}
                            />
                        </div>

                        <ExpenseSummary
                            totalExpense={totalExpense}
                            totalCount={expenseList.length}
                            fmt={fmt}
                        />

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
                            <ExpenseList
                                expenses={expenseList}
                                onAddClick={() => {
                                    setEditTarget(null);
                                    setShowModal(true);
                                }}
                                onEdit={handleEdit}
                                fmt={fmt}
                                pagination={expenses}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ExpenseFormModal
                open={showModal}
                onOpenChange={handleModalClose}
                date={date}
                onSuccess={handleModalSuccess}
                storeCashBalance={storeCashBalance}
                editTarget={editTarget}
            />

            <Toaster position="top-right" richColors closeButton />
        </CashierLayout>
    );
}
