import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ChevronLeft, Loader2, Store, Banknote } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const schema = (currentBalance) =>
    z.object({
        amount: z
            .string()
            .min(1, "Jumlah wajib diisi")
            .refine(
                (val) => {
                    const num = parseFloat(val);
                    return num > 0 && num <= currentBalance;
                },
                {
                    message: `Jumlah melebihi saldo dompet (${fmt(currentBalance)})`,
                },
            ),
        description: z.string().min(1, "Deskripsi wajib diisi").max(200),
        notes: z.string().optional(),
        transacted_at: z.string().min(1, "Tanggal wajib diisi"),
    });

export function SendToStoreForm({ currentBalance = 0 }) {
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

    const form = useForm({
        resolver: zodResolver(schema(currentBalance)),
        defaultValues: {
            amount: "",
            description: "",
            notes: "",
            transacted_at: new Date().toISOString().split("T")[0],
        },
    });

    const {
        formState: { isSubmitting, isDirty },
        reset,
    } = form;

    const onSubmit = form.handleSubmit((data) => {
        router.post(route("owner.wallet.send-to-store"), data, {
            preserveScroll: true,
            onSuccess: () => {
                reset(data);
            },
        });
    });

    const handleDiscard = () => {
        if (isDirty) {
            setShowDiscardDialog(true);
        } else {
            router.visit(route("owner.wallet"));
        }
    };

    const confirmDiscard = () => {
        setShowDiscardDialog(false);
        router.visit(route("owner.wallet"));
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={onSubmit}>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleDiscard}
                                className="h-9 w-9 shrink-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Dompet Owner
                                </p>
                                <h1 className="text-xl font-bold tracking-tight">
                                    Kirim ke Kas Toko
                                </h1>
                            </div>
                        </div>
                        <div className="hidden sm:flex gap-2 sm:shrink-0">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleDiscard}
                                className="flex-1 sm:flex-none"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Kirim ke Kas Toko
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-6">
                        <div className="space-y-4 lg:col-span-4">
                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Store className="h-4 w-4 text-emerald-600" />
                                        Transfer ke Kas Toko
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                                        <p className="text-xs text-muted-foreground">
                                            Saldo Dompet Saat Ini
                                        </p>
                                        <p className="text-xl font-bold text-primary">
                                            {fmt(currentBalance)}
                                        </p>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jumlah</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                                            Rp
                                                        </span>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Deskripsi</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Contoh: Transfer modal ke toko"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Catatan (opsional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        placeholder="Tambahkan catatan jika perlu..."
                                                        rows={3}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="transacted_at"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tanggal</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="date"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4 lg:col-span-2">
                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Informasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 pt-0 space-y-3">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                                Uang akan masuk ke{" "}
                                                <strong>Kas Toko</strong>. Saldo
                                                dompet akan berkurang sejumlah
                                                yang dikirim.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sm:hidden">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={handleDiscard}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Kirim
                            </Button>
                        </div>
                    </div>

                    <div className="h-[72px] sm:h-0" />
                </form>
            </Form>

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
