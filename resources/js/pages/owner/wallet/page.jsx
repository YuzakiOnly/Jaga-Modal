import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { toast, Toaster } from "sonner";
import { route } from "ziggy-js";
import { Plus, ArrowDownCircle, Store } from "lucide-react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { PeriodFilter } from "./_components/PeriodFilter";
import { WalletStats } from "./_components/WalletStats";
import { WalletTable } from "./_components/WalletTable";
import { WalletList } from "./_components/WalletList";
import { DeleteDialog } from "@/components/shared/DeleteDialog";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";
import { useDeviceType } from "@/hooks/use-mobile";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function WalletPage({ transactions, summary, filters }) {
    const { flash } = usePage().props;
    const deviceType = useDeviceType();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useSmartRefresh({ ...refreshConfigs.owner_wallet });

    const handleDeleteClick = (transaction) => {
        if (transaction.source === "withdrawal") {
            toast.error(
                "Transaksi dari penarikan toko hanya bisa dihapus dari halaman Pengeluaran.",
            );
            return;
        }
        setDeleteItem(transaction);
        setDeleteOpen(true);
    };

    const deleteMeta = deleteItem ? (
        <>
            <p className="text-sm">
                <span className="font-semibold">Deskripsi:</span>{" "}
                {deleteItem.description}
            </p>
            <p className="text-sm">
                <span className="font-semibold">Jumlah:</span>{" "}
                <span
                    className={
                        deleteItem.flow === "in"
                            ? "text-green-600"
                            : "text-rose-600"
                    }
                >
                    {deleteItem.flow === "in" ? "+" : "-"}{" "}
                    {fmt(deleteItem.amount)}
                </span>
            </p>
            <p className="text-sm">
                <span className="font-semibold">Tanggal:</span>{" "}
                {deleteItem.transacted_at
                    ? new Date(deleteItem.transacted_at).toLocaleDateString(
                          "id-ID",
                          {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                          },
                      )
                    : "-"}
            </p>
            {deleteItem.source === "store_transfer" && (
                <p className="text-sm text-amber-600">
                    ⚠️ Data di Kas Toko juga akan dihapus.
                </p>
            )}
        </>
    ) : null;

    return (
        <>
            <Head title="Dompet Owner" />

            <div className="space-y-5 p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                            Dompet Owner
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Kelola saldo pribadi dari hasil penarikan toko
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                            onClick={() =>
                                router.get(route("owner.wallet.create"))
                            }
                            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-border bg-background px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">
                                Kirim ke Toko
                            </span>
                            <span className="sm:hidden">Kirim</span>
                        </button>
                        <button
                            onClick={() =>
                                router.get(route("owner.wallet.spend"))
                            }
                            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-destructive/30 bg-background px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-destructive shadow-sm hover:bg-destructive/10 transition-colors"
                        >
                            <ArrowDownCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">
                                Pengeluaran
                            </span>
                            <span className="sm:hidden">Keluar</span>
                        </button>
                        <button
                            onClick={() =>
                                router.get(route("owner.wallet.topup"))
                            }
                            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">
                                Tambah Saldo
                            </span>
                            <span className="sm:hidden">Topup</span>
                        </button>
                    </div>
                </div>

                <PeriodFilter filters={filters} />

                <WalletStats summary={summary} />

                {deviceType !== "desktop" ? (
                    <WalletList
                        transactions={transactions}
                        onDelete={handleDeleteClick}
                    />
                ) : (
                    <WalletTable
                        transactions={transactions}
                        onDelete={handleDeleteClick}
                    />
                )}
            </div>

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                item={deleteItem}
                routeName="owner.wallet.destroy"
                title={
                    deleteItem?.source === "store_transfer"
                        ? "Hapus Transfer ke Toko"
                        : "Hapus Transaksi"
                }
                label="Hapus"
                meta={deleteMeta}
            />

            <Toaster position="top-right" richColors />
        </>
    );
}

WalletPage.layout = (page) => <AppLayout>{page}</AppLayout>;
