import { useState, useEffect } from "react";
import { route } from "ziggy-js";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { ExpenseTable } from "./_components/ExpenseTable";
import { ExpenseList } from "./_components/ExpenseList";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Wallet,
    TrendingDown,
    ArrowLeftRight,
    Loader2,
    Plus,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { useDeviceType } from "@/hooks/use-mobile";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";
import { PeriodFilter } from "./_components/PeriodFilter";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function ExpensesPage({
    expenses,
    summary,
    filters,
    cash_balance,
}) {
    const [deleteExpense, setDeleteExpense] = useState(null);
    const [loading, setLoading] = useState(false);
    const { flash } = usePage().props;
    const deviceType = useDeviceType();

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useSmartRefresh({ ...refreshConfigs.owner_expenses });

    const total = summary?.total ?? 0;
    const byType = summary?.by_type ?? {};
    const totalPengeluaran =
        (byType.simple || 0) +
        (byType.raw_material || 0) +
        (byType.salary || 0) +
        (byType.owner_withdrawal || 0);
    const totalPemasukan = byType.store_transfer_in || 0;

    const stats = [
        {
            title: "Total Transaksi",
            value: total,
            icon: TrendingDown,
            iconColor: "text-rose-500",
            bgColor: "bg-rose-50",
        },
        {
            title: "Pengeluaran",
            value: totalPengeluaran,
            icon: Wallet,
            iconColor: "text-rose-500",
            bgColor: "bg-rose-50",
        },
        {
            title: "Transfer Masuk",
            value: totalPemasukan,
            icon: ArrowLeftRight,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50",
            showSign: true,
            isIncome: true,
        },
    ];

    const handleAdd = () => {
        router.get(route("owner.expenses.create"));
    };

    return (
        <>
            <Head title="Kas Toko" />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Kas Toko
                        </h1>
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    <Button
                        onClick={handleAdd}
                        className="h-9 w-9 p-0 sm:h-10 sm:w-auto sm:px-4"
                    >
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">
                            Tambah Transaksi
                        </span>
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="shadow-none">
                            <CardHeader className="p-4 sm:p-6">
                                <CardDescription>{stat.title}</CardDescription>
                                <CardTitle className="font-display text-2xl">
                                    {stat.showSign && stat.value >= 0
                                        ? "+"
                                        : ""}
                                    {fmt(Math.abs(stat.value))}
                                </CardTitle>
                                <CardAction>
                                    <Badge variant="outline" className="p-2">
                                        <stat.icon
                                            className={`h-3.5 w-3.5 ${stat.iconColor}`}
                                        />
                                    </Badge>
                                </CardAction>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <PeriodFilter filters={filters} />

                {deviceType !== "desktop" ? (
                    <ExpenseList
                        expenses={expenses}
                        onDelete={setDeleteExpense}
                    />
                ) : (
                    <ExpenseTable
                        expenses={expenses}
                        onDelete={setDeleteExpense}
                    />
                )}
            </div>

            <DeleteDialog
                item={deleteExpense}
                open={!!deleteExpense}
                onOpenChange={(open) => !open && setDeleteExpense(null)}
                routeName="owner.expenses.destroy"
                title="Hapus Transaksi"
                label="Hapus Transaksi"
                meta={
                    <>
                        <p className="text-sm font-medium text-destructive">
                            Transaksi:{" "}
                            <span className="font-bold wrap-break-word">
                                {deleteExpense?.description}
                            </span>
                        </p>
                        <p className="text-sm font-medium">
                            Jumlah:{" "}
                            <span className="font-bold">
                                {fmt(deleteExpense?.amount)}
                            </span>
                        </p>
                    </>
                }
            />
            <Toaster position="top-right" richColors />
        </>
    );
}

ExpensesPage.layout = (page) => <AppLayout>{page}</AppLayout>;
