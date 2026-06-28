import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { toast, Toaster } from "sonner";
import { route } from "ziggy-js";
import { Plus } from "lucide-react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { PeriodFilter } from "./_components/PeriodFilter";
import { ExpenseStats } from "./_components/ExpenseStats";
import { ExpenseTable } from "./_components/ExpenseTable";
import { ExpenseList } from "./_components/ExpenseList";
import { ExpenseFormDialog } from "./_components/ExpenseFormDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";
import { useDeviceType } from "@/hooks/use-mobile";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function ExpensesPage({
    expenses,
    summary,
    filters,
    cashBalance,
}) {
    const { flash, props } = usePage();
    const deviceType = useDeviceType();
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    // Cek semua props yang masuk
    console.log("Semua props:", props);
    console.log("cashBalance dari props:", props.cash_balance);
    console.log("cashBalance dari parameter:", cashBalance);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useSmartRefresh({ ...refreshConfigs.owner_expenses });

    const handleEdit = (expense) => {
        setEditTarget(expense);
        setFormOpen(true);
    };

    const handleDeleteClick = (expense) => {
        setDeleteTarget(expense);
        setDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleteProcessing(true);
        router.delete(route("owner.expenses.destroy", deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setDeleteTarget(null);
                setDeleteProcessing(false);
                toast.success("Transaksi berhasil dihapus.");
            },
            onError: () => {
                setDeleteProcessing(false);
                toast.error("Gagal menghapus transaksi.");
            },
        });
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setEditTarget(null);
    };

    // Gunakan cashBalance dari props jika parameter undefined
    const balance = cashBalance ?? props.cash_balance ?? 0;

    return (
        <>
            <Head title="Kas Toko" />

            <div className="space-y-5 p-4 lg:p-6">
                <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                            Kas Toko
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Catat dan pantau semua pemasukan & pengeluaran toko
                        </p>
                    </div>
                    <Button
                        onClick={() => setFormOpen(true)}
                        size="default"
                        className="gap-2 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">
                            Tambah Transaksi
                        </span>
                    </Button>
                </div>

                <PeriodFilter filters={filters} />

                <ExpenseStats summary={summary} />

                {deviceType !== "desktop" ? (
                    <ExpenseList
                        expenses={expenses}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                ) : (
                    <ExpenseTable
                        expenses={expenses}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                )}
            </div>

            <ExpenseFormDialog
                open={formOpen}
                onOpenChange={handleFormClose}
                editTarget={editTarget}
                cashBalance={balance}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base sm:text-lg">
                            Hapus Transaksi
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    Apakah Anda yakin ingin menghapus transaksi
                                    ini? Data yang dihapus tidak dapat
                                    dikembalikan.
                                </p>
                                {deleteTarget && (
                                    <div className="mt-2 pt-3 border-t space-y-1">
                                        <p className="text-sm text-foreground">
                                            <span className="font-semibold">
                                                Deskripsi:
                                            </span>{" "}
                                            {deleteTarget.description}
                                        </p>
                                        <p className="text-sm text-foreground">
                                            <span className="font-semibold">
                                                Jumlah:
                                            </span>{" "}
                                            <span className="text-destructive">
                                                {fmt(deleteTarget.amount)}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel
                            disabled={deleteProcessing}
                            className="w-full sm:w-auto"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteProcessing}
                            className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
                        >
                            {deleteProcessing ? "Menghapus..." : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Toaster position="top-right" richColors />
        </>
    );
}

ExpensesPage.layout = (page) => <AppLayout>{page}</AppLayout>;
