// page.jsx
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
import { TopupDialog } from "./_components/TopupDialog";
import { SpendDialog } from "./_components/SpendDialog";
import { SendToStoreDialog } from "./_components/SendToStoreDialog";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";
import { useDeviceType } from "@/hooks/use-mobile";

export default function WalletPage({ transactions, summary, filters }) {
    const { flash } = usePage().props;
    const deviceType = useDeviceType();
    const [topupOpen, setTopupOpen] = useState(false);
    const [spendOpen, setSpendOpen] = useState(false);
    const [sendToStoreOpen, setSendToStoreOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useSmartRefresh({ ...refreshConfigs.owner_wallet });

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
                            onClick={() => setSendToStoreOpen(true)}
                            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-border bg-background px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">
                                Kirim ke Toko
                            </span>
                            <span className="sm:hidden">Kirim</span>
                        </button>
                        <button
                            onClick={() => setSpendOpen(true)}
                            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-destructive/30 bg-background px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-destructive shadow-sm hover:bg-destructive/10 transition-colors"
                        >
                            <ArrowDownCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                            <span className="hidden sm:inline">
                                Pengeluaran
                            </span>
                            <span className="sm:hidden">Keluar</span>
                        </button>
                        <button
                            onClick={() => setTopupOpen(true)}
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
                    <WalletList transactions={transactions} />
                ) : (
                    <WalletTable transactions={transactions} />
                )}
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
