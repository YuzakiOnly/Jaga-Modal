// SpendDialog.jsx
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Loader2, ArrowDownCircle } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export function SpendDialog({ open, onOpenChange, currentBalance = 0 }) {
    const [form, setForm] = useState({
        amount: "",
        description: "",
        notes: "",
        transacted_at: new Date().toISOString().split("T")[0],
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [initialForm, setInitialForm] = useState(null);

    useEffect(() => {
        if (open) {
            const newForm = {
                amount: "",
                description: "",
                notes: "",
                transacted_at: new Date().toISOString().split("T")[0],
            };
            setForm(newForm);
            setInitialForm(JSON.stringify(newForm));
            setErrors({});
            setProcessing(false);
            setShowDiscardDialog(false);
        }
    }, [open]);

    const hasChanges = () => {
        return JSON.stringify(form) !== initialForm;
    };

    const handleClose = () => {
        if (hasChanges()) {
            setShowDiscardDialog(true);
        } else {
            onOpenChange(false);
        }
    };

    const confirmDiscard = () => {
        setShowDiscardDialog(false);
        onOpenChange(false);
    };

    const handleSubmit = () => {
        const amountNum = parseFloat(form.amount);
        const newErrors = {};

        if (!form.amount || amountNum <= 0) {
            newErrors.amount = "Jumlah harus lebih dari 0";
        } else if (amountNum > currentBalance) {
            newErrors.amount = `Jumlah melebihi saldo (${fmt(currentBalance)})`;
        }
        if (!form.description.trim())
            newErrors.description = "Deskripsi wajib diisi";
        if (!form.transacted_at)
            newErrors.transacted_at = "Tanggal wajib diisi";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);
        setErrors({});

        router.post(route("owner.wallet.spend"), form, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                setProcessing(false);
                toast.success("Pengeluaran berhasil dicatat.");
            },
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent
                    className="sm:max-w-md p-4 sm:p-6 rounded-xl sm:rounded-lg"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0" />
                            Pengeluaran Pribadi
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Catat pengeluaran dari dompet pribadi untuk
                            keperluan di luar toko
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                            <p className="text-xs text-muted-foreground">
                                Saldo Saat Ini
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-primary">
                                {fmt(currentBalance)}
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-medium">
                                Jumlah{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
                                    Rp
                                </span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    className="pl-10 h-9 sm:h-10 text-sm"
                                    value={form.amount}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            amount: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.amount}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-medium">
                                Deskripsi{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                placeholder="Contoh: Belanja bulanan, Cicilan motor"
                                className="h-9 sm:h-10 text-sm"
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-medium">
                                Catatan (opsional)
                            </Label>
                            <Textarea
                                placeholder="Tambahkan catatan jika perlu..."
                                rows={3}
                                className="text-sm resize-none"
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-medium">
                                Tanggal{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="date"
                                className="h-9 sm:h-10 text-sm"
                                value={form.transacted_at}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        transacted_at: e.target.value,
                                    })
                                }
                            />
                            {errors.transacted_at && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.transacted_at}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                            className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            variant="destructive"
                            className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Catat Pengeluaran
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={showDiscardDialog}
                onOpenChange={setShowDiscardDialog}
            >
                <AlertDialogContent className="max-w-[95vw] sm:max-w-106.25">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Buang perubahan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda memiliki perubahan yang belum disimpan. Apakah
                            Anda yakin ingin membuangnya? Tindakan ini tidak
                            dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="mt-0 sm:mt-0 cursor-pointer">
                            Lanjutkan Mengedit
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDiscard}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Buang
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
