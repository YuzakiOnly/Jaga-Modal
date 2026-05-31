import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { toast, Toaster } from "sonner";
import { route } from "ziggy-js";
import { Plus } from "lucide-react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { PeriodFilter } from "./_components/PeriodFilter";
import { ExpenseStats } from "./_components/ExpenseStats";
import { ExpenseTable } from "./_components/ExpenseTable";
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

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function ExpensesPage({
    expenses,
    summary,
    filters,
    storeCashBalance,
}) {
    const { flash } = usePage().props;
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

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
                toast.success("Pengeluaran berhasil dihapus.");
            },
            onError: () => {
                setDeleteProcessing(false);
                toast.error("Gagal menghapus pengeluaran.");
            },
        });
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setEditTarget(null);
    };

    return (
        <>
            <Head title="Pengeluaran" />

            <div className="p-3 py-6 md:py-0 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 max-w-6xl mx-auto">
                <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                            Pengeluaran
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Catat dan pantau semua pengeluaran toko
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setFormOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-2.5 sm:px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors shrink-0"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">
                            Tambah Pengeluaran
                        </span>
                    </Button>
                </div>

                <PeriodFilter filters={filters} />

                <ExpenseStats summary={summary} />

                <ExpenseTable
                    expenses={expenses}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            </div>

            <ExpenseFormDialog
                open={formOpen}
                onOpenChange={handleFormClose}
                editTarget={editTarget}
                storeCashBalance={storeCashBalance}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base sm:text-lg">
                            Hapus Pengeluaran
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    Apakah Anda yakin ingin menghapus
                                    pengeluaran ini? Data yang dihapus tidak
                                    dapat dikembalikan.
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
                                            <span className="text-rose-600">
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
