import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Loader2, Pencil } from "lucide-react";
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

export function EditDialog({ open, onOpenChange, transaction }) {
    const [form, setForm] = useState({
        description: "",
        notes: "",
        transacted_at: "",
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open && transaction) {
            setForm({
                description: transaction.description || "",
                notes: transaction.notes || "",
                transacted_at:
                    transaction.transacted_at ||
                    new Date().toISOString().split("T")[0],
            });
            setErrors({});
            setProcessing(false);
        }
    }, [open, transaction]);

    const handleSubmit = () => {
        const newErrors = {};
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

        router.put(route("owner.wallet.update", transaction.id), form, {
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

    const isIncome = transaction?.flow === "in";
    const title = isIncome ? "Edit Pemasukan" : "Edit Pengeluaran";
    const description = isIncome
        ? "Ubah informasi pemasukan ke dompet pribadi"
        : "Ubah informasi pengeluaran dari dompet pribadi";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-md rounded-xl sm:rounded-lg p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Pencil className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm text-muted-foreground">
                            Jumlah (tidak dapat diubah)
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs sm:text-sm">
                                Rp
                            </span>
                            <Input
                                type="number"
                                className="pl-10 bg-muted/40 cursor-not-allowed h-9 sm:h-10 text-sm"
                                value={transaction?.amount || ""}
                                readOnly
                                disabled
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">
                            Deskripsi{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="Deskripsi transaksi"
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
                            <p className="text-xs text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">
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
                        <Label className="text-xs sm:text-sm">
                            Tanggal <span className="text-destructive">*</span>
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
                            <p className="text-xs text-destructive">
                                {errors.transacted_at}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                        className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
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
    );
}
