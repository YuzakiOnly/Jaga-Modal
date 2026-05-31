import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import CashierLayout from "@/layouts/CashierLayout";
import ExpenseFormModal from "./_components/ExpenseFormModal";
import ExpenseHeader from "./_components/ExpenseHeader";
import ExpenseSummary from "./_components/ExpenseSummary";
import ExpenseList from "./_components/ExpenseList";
import { toast, Toaster } from "sonner";

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

            <div className="flex-1 overflow-y-auto bg-slate-50">
                <div className="max-w-5xl mx-auto p-4 sm:p-5 space-y-4 sm:space-y-5">
                    <ExpenseHeader
                        date={date}
                        onDateChange={handleDateChange}
                        onAddClick={() => {
                            setEditTarget(null);
                            setShowModal(true);
                        }}
                    />

                    <ExpenseSummary
                        totalExpense={totalExpense}
                        totalCount={expenseList.length}
                        fmt={fmt}
                    />

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
