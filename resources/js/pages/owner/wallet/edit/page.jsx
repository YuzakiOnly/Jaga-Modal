import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { EditForm } from "../_components/EditForm";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { toast } from "sonner";

export default function EditWalletPage({ transaction }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const isWithdrawal = transaction?.source === "withdrawal";

    if (isWithdrawal) {
        return (
            <>
                <Head title="Edit Transaksi" />
                <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                    <div className="text-center py-12 border rounded-lg">
                        <p className="text-muted-foreground mb-4">
                            Transaksi dari penarikan toko tidak bisa diedit.
                        </p>
                        <Button
                            onClick={() => router.get(route("owner.expenses"))}
                        >
                            Buka Halaman Pengeluaran
                        </Button>
                    </div>
                </div>
                <Toaster position="top-right" richColors />
            </>
        );
    }

    return (
        <>
            <Head title="Edit Transaksi" />
            <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <div className="space-y-4">
                    <EditForm transaction={transaction} />
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </>
    );
}

EditWalletPage.layout = (page) => <AppLayout>{page}</AppLayout>;
