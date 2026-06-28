// EditDialog.jsx
import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
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

export function EditDialog({ open, onOpenChange, transaction }) {
    const [form, setForm] = useState({
        description: "",
        notes: "",
        transacted_at: new Date(),
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [initialForm, setInitialForm] = useState(null);

    useEffect(() => {
        if (transaction && open) {
            const newForm = {
                description: transaction.description || "",
                notes: transaction.notes || "",
                transacted_at: transaction.transacted_at
                    ? new Date(transaction.transacted_at)
                    : new Date(),
            };
            setForm(newForm);
            setInitialForm(JSON.stringify(newForm));
            setErrors({});
            setProcessing(false);
            setShowDiscardDialog(false);
        }
    }, [transaction, open]);

    if (!transaction) return null;

    const isStoreTransfer = transaction.source === "store_transfer";
    const isWithdrawal = transaction.source === "withdrawal";

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
        setProcessing(true);
        setErrors({});

        const newErrors = {};
        if (!form.description.trim()) {
            newErrors.description = "Deskripsi wajib diisi";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setProcessing(false);
            return;
        }

        const payload = {
            description: form.description,
            notes: form.notes,
            transacted_at: format(form.transacted_at, "yyyy-MM-dd"),
        };

        router.put(route("owner.wallet.update", transaction.id), payload, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                setProcessing(false);
                toast.success("Transaksi berhasil diupdate.");
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
                        <DialogTitle className="text-base sm:text-lg">
                            Edit Transaksi
                        </DialogTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {isStoreTransfer
                                ? "Edit transfer ke toko (akan update juga di Kas Toko)"
                                : isWithdrawal
                                  ? "Transaksi dari penarikan toko tidak bisa diedit"
                                  : "Edit data transaksi"}
                        </p>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-medium">
                                Deskripsi{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                className="h-9 sm:h-10 text-sm"
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                                disabled={isWithdrawal}
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-medium">
                                Catatan
                            </Label>
                            <Input
                                className="h-9 sm:h-10 text-sm"
                                placeholder="Tambahkan catatan..."
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                disabled={isWithdrawal}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm font-medium">
                                Tanggal{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal h-9 sm:h-10 text-xs sm:text-sm"
                                        disabled={isWithdrawal}
                                    >
                                        <CalendarIcon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                        {form.transacted_at ? (
                                            format(form.transacted_at, "PPP", {
                                                locale: id,
                                            })
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={form.transacted_at}
                                        onSelect={(date) =>
                                            setForm({
                                                ...form,
                                                transacted_at:
                                                    date || new Date(),
                                            })
                                        }
                                        initialFocus
                                        locale={id}
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.transacted_at && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.transacted_at}
                                </p>
                            )}
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Jumlah:{" "}
                                <span className="font-semibold text-foreground">
                                    {fmt(transaction.amount)}
                                </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Tipe:{" "}
                                <span className="font-medium">
                                    {transaction.flow === "in"
                                        ? "Masuk"
                                        : "Keluar"}
                                </span>
                            </p>
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
                            disabled={processing || isWithdrawal}
                            className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={showDiscardDialog}
                onOpenChange={setShowDiscardDialog}
            >
                <AlertDialogContent className="max-w-[95vw] sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Buang perubahan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda memiliki perubahan yang belum disimpan. Apakah
                            Anda yakin ingin membuangnya? Tindakan ini tidak
                            dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel className="mt-0 sm:mt-0">
                            Lanjutkan Mengedit
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDiscard}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Buang
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
