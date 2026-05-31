import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { Loader2, Store } from "lucide-react";
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

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export function SendToStoreDialog({ open, onOpenChange, currentBalance = 0 }) {
    const [form, setForm] = useState({
        amount: "",
        description: "",
        notes: "",
        transacted_at: new Date().toISOString().split("T")[0],
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setForm({
                amount: "",
                description: "",
                notes: "",
                transacted_at: new Date().toISOString().split("T")[0],
            });
            setErrors({});
            setProcessing(false);
        }
    }, [open]);

    const handleSubmit = () => {
        const amountNum = parseFloat(form.amount);
        const newErrors = {};

        if (!form.amount || amountNum <= 0) {
            newErrors.amount = "Jumlah harus lebih dari 0";
        } else if (amountNum > currentBalance) {
            newErrors.amount = `Jumlah melebihi saldo dompet (${fmt(currentBalance)})`;
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

        router.post(route("owner.wallet.send-to-store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                setProcessing(false);
                toast.success("Saldo berhasil dikirim ke kas toko.");
            },
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-md rounded-xl sm:rounded-lg p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Store className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                        Kirim ke Kas Toko
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        Transfer saldo dari dompet pribadi ke kas toko
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4 py-2">
                    <div className="bg-muted/50 rounded-lg p-2.5 sm:p-3 text-center">
                        <p className="text-xs text-muted-foreground">
                            Saldo Dompet Saat Ini
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-primary">
                            {fmt(currentBalance)}
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">
                            Jumlah <span className="text-destructive">*</span>
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
                                    setForm({ ...form, amount: e.target.value })
                                }
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-xs text-destructive">
                                {errors.amount}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">
                            Deskripsi{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="Contoh: Transfer modal ke toko"
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

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs text-blue-700">
                            Saldo dompet akan berkurang dan kas toko akan
                            bertambah sejumlah yang dikirim.
                        </p>
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
                        Kirim ke Toko
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
