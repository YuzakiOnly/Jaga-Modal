import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import ExpenseForm from "../_components/ExpenseForm";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { toast } from "sonner";

export default function EditExpensePage({ expense, cashBalance }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const isProtected =
        expense?.type === "store_transfer_in" &&
        expense?.is_from_wallet === true;

    if (isProtected) {
        return (
            <>
                <Head title="Edit Transaksi" />
                <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                    <div className="text-center py-12 border rounded-lg">
                        <p className="text-muted-foreground mb-4">
                            Transaksi ini berasal dari transfer wallet owner dan
                            tidak dapat diedit di sini.
                        </p>
                        <Button
                            onClick={() => router.get(route("owner.wallet"))}
                        >
                            Buka Halaman Wallet
                        </Button>
                    </div>
                </div>
                <Toaster position="top-right" richColors />
            </>
        );
    }

    return (
        <>
            <Head title={`Edit ${expense?.description}`} />
            <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <div className="space-y-4">
                    <ExpenseForm expense={expense} cashBalance={cashBalance} />
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </>
    );
}

EditExpensePage.layout = (page) => <AppLayout>{page}</AppLayout>;
