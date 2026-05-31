import { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import { toast, Toaster } from "sonner";
import { route } from "ziggy-js";
import { Plus, ArrowDownCircle, Store } from "lucide-react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { PeriodFilter } from "./_components/PeriodFilter";
import { WalletStats } from "./_components/WalletStats";
import { WalletTable } from "./_components/WalletTable";
import { TopupDialog } from "./_components/TopupDialog";
import { SpendDialog } from "./_components/SpendDialog";
import { SendToStoreDialog } from "./_components/SendToStoreDialog";

export default function WalletPage({ transactions, summary, filters }) {
    const { flash } = usePage().props;
    const [topupOpen, setTopupOpen] = useState(false);
    const [spendOpen, setSpendOpen] = useState(false);
    const [sendToStoreOpen, setSendToStoreOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <>
            <Head title="Dompet Owner" />

            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6 max-w-6xl mx-auto">
                <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                            Dompet Owner
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Kelola saldo pribadi dari hasil penarikan toko
                        </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => setSendToStoreOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 sm:px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
                        >
                            <Store className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">
                                Kirim ke Toko
                            </span>
                        </button>
                        <button
                            onClick={() => setSpendOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-background px-2.5 sm:px-4 py-2 text-sm font-semibold text-destructive shadow-sm hover:bg-destructive/10 transition-colors"
                        >
                            <ArrowDownCircle className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">
                                Pengeluaran Pribadi
                            </span>
                        </button>
                        <button
                            onClick={() => setTopupOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-2.5 sm:px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">
                                Tambah Saldo
                            </span>
                        </button>
                    </div>
                </div>

                <PeriodFilter filters={filters} />

                <WalletStats summary={summary} />

                <WalletTable transactions={transactions} />
            </div>

            <TopupDialog open={topupOpen} onOpenChange={setTopupOpen} />
            <SpendDialog
                open={spendOpen}
                onOpenChange={setSpendOpen}
                currentBalance={summary?.balance ?? 0}
            />
            <SendToStoreDialog
                open={sendToStoreOpen}
                onOpenChange={setSendToStoreOpen}
                currentBalance={summary?.balance ?? 0}
            />

            <Toaster position="top-right" richColors />
        </>
    );
}

WalletPage.layout = (page) => <AppLayout>{page}</AppLayout>;
