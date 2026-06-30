import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    ChevronLeft,
    Loader2,
    Package,
    Users,
    FileText,
    Wallet,
    ArrowLeftRight,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { expenseSchema } from "@/schemas/owner/expenseSchema";

const EXPENSE_TYPES = [
    { value: "simple", label: "Simple", icon: FileText },
    { value: "raw_material", label: "Bahan Baku", icon: Package },
    { value: "salary", label: "Gaji", icon: Users },
    { value: "owner_withdrawal", label: "Penarikan Owner", icon: Wallet },
    {
        value: "store_transfer_in",
        label: "Transfer Masuk",
        icon: ArrowLeftRight,
    },
];

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function ExpenseForm({ expense, cashBalance }) {
    const isEditing = !!expense;
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [type, setType] = useState(expense?.type || "simple");

    const defaultValues = {
        type: expense?.type || "simple",
        description: expense?.description || "",
        amount: expense?.amount?.toString() || "",
        quantity: expense?.quantity?.toString() || "",
        unit_price: expense?.unit_price?.toString() || "",
        employee_name: expense?.employee_name || "",
        salary_period: expense?.salary_period || "",
        expensed_at: expense?.expensed_at
            ? new Date(expense.expensed_at)
            : new Date(),
        notes: expense?.notes || "",
    };

    const form = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues,
    });

    const {
        formState: { isSubmitting, isDirty },
        reset,
        watch,
        setValue,
    } = form;

    const currentType = watch("type");
    const quantity = watch("quantity");
    const unitPrice = watch("unit_price");
    const amount = watch("amount");

    const calculateTotal = () => {
        if (currentType === "raw_material" && quantity && unitPrice) {
            return parseFloat(quantity) * parseFloat(unitPrice);
        }
        return parseFloat(amount) || 0;
    };

    const totalAmount = calculateTotal();
    const currentBalance = cashBalance || 0;

    const showAmountField =
        currentType === "simple" ||
        currentType === "owner_withdrawal" ||
        currentType === "store_transfer_in";

    const showDetailLabel =
        currentType === "owner_withdrawal"
            ? "Jumlah Penarikan"
            : currentType === "store_transfer_in"
              ? "Jumlah Transfer"
              : "Jumlah";

    const onSubmit = form.handleSubmit((data) => {
        const payload = {
            type: data.type,
            description: data.description,
            expensed_at: format(new Date(data.expensed_at), "yyyy-MM-dd"),
            notes: data.notes,
        };

        if (data.type === "raw_material") {
            payload.quantity = data.quantity;
            payload.unit_price = data.unit_price;
        } else if (data.type === "salary") {
            payload.employee_name = data.employee_name;
            payload.salary_period = data.salary_period;
            payload.amount = data.amount;
        } else {
            payload.amount = data.amount;
        }

        if (isEditing) {
            router.put(route("owner.expenses.update", expense.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    reset(data);
                },
            });
        } else {
            router.post(route("owner.expenses.store"), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    reset(data);
                },
            });
        }
    });

    const handleDiscard = () => {
        if (isDirty) {
            setShowDiscardDialog(true);
        } else {
            router.visit(route("owner.expenses"));
        }
    };

    const confirmDiscard = () => {
        setShowDiscardDialog(false);
        router.visit(route("owner.expenses"));
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
                                    Kas Toko
                                </p>
                                <h1 className="text-xl font-bold tracking-tight">
                                    {isEditing
                                        ? `Edit Transaksi`
                                        : "Tambah Transaksi"}
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
                                className="flex-1 sm:flex-none"
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditing ? "Simpan" : "Simpan"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-6">
                        <div className="space-y-4 lg:col-span-4">
                            <Card className="shadow-none">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-base">
                                        Informasi Transaksi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 px-6 pb-6 pt-0">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Tipe Transaksi
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {EXPENSE_TYPES.map(
                                                            ({
                                                                value,
                                                                label,
                                                                icon: Icon,
                                                            }) => (
                                                                <button
                                                                    key={value}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setType(
                                                                            value,
                                                                        );
                                                                        field.onChange(
                                                                            value,
                                                                        );
                                                                    }}
                                                                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all ${
                                                                        field.value ===
                                                                        value
                                                                            ? "border-primary bg-primary/10 text-primary"
                                                                            : "border-border hover:border-primary/50 hover:bg-accent"
                                                                    }`}
                                                                >
                                                                    <Icon className="h-5 w-5 shrink-0" />
                                                                    <span className="text-xs font-medium text-center leading-tight">
                                                                        {label}
                                                                    </span>
                                                                </button>
                                                            ),
                                                        )}
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
                                                        placeholder={
                                                            currentType ===
                                                            "raw_material"
                                                                ? "Contoh: Tepung terigu 25kg"
                                                                : currentType ===
                                                                    "salary"
                                                                  ? "Contoh: Gaji bulan Mei"
                                                                  : currentType ===
                                                                      "owner_withdrawal"
                                                                    ? "Contoh: Penarikan untuk kebutuhan pribadi"
                                                                    : currentType ===
                                                                        "store_transfer_in"
                                                                      ? "Contoh: Transfer dari wallet owner"
                                                                      : "Contoh: Beli ATK kantor"
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {currentType === "raw_material" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="quantity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Jumlah
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="Contoh: 10"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="unit_price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Harga Satuan
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="Contoh: 5000"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {quantity && unitPrice && (
                                                <div
                                                    className={`col-span-2 text-sm p-2 rounded-lg text-center ${
                                                        totalAmount >
                                                            currentBalance &&
                                                        !isEditing
                                                            ? "bg-red-50 text-red-700"
                                                            : "bg-primary/10 text-primary"
                                                    }`}
                                                >
                                                    Total: {fmt(totalAmount)}
                                                    {totalAmount >
                                                        currentBalance &&
                                                        !isEditing && (
                                                            <span className="block text-xs text-red-600 mt-1">
                                                                Melebihi saldo
                                                                kas toko!
                                                            </span>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {currentType === "salary" && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="employee_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Nama Karyawan
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Contoh: Ahmad Santoso"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="salary_period"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Periode
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Contoh: Mei 2026"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="amount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Jumlah Gaji
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="Contoh: 5000000"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {showAmountField && (
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {showDetailLabel}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="expensed_at"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Tanggal</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-start text-left font-normal"
                                                            >
                                                                {field.value ? (
                                                                    format(
                                                                        field.value,
                                                                        "PPP",
                                                                        {
                                                                            locale: id,
                                                                        },
                                                                    )
                                                                ) : (
                                                                    <span>
                                                                        Pilih
                                                                        tanggal
                                                                    </span>
                                                                )}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                field.value
                                                            }
                                                            onSelect={
                                                                field.onChange
                                                            }
                                                            initialFocus
                                                            locale={id}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
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
                                                        placeholder="Tambahkan catatan..."
                                                        rows={2}
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
                                        Ringkasan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 pt-0 space-y-3">
                                    <div className="bg-slate-50 border rounded-lg p-3">
                                        <p className="text-sm text-muted-foreground">
                                            Saldo Kas Toko saat ini:{" "}
                                            <strong
                                                className={
                                                    currentBalance <= 0
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }
                                            >
                                                {fmt(currentBalance)}
                                            </strong>
                                        </p>
                                        {currentType === "owner_withdrawal" && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                Penarikan akan mengurangi saldo
                                                kas toko dan menambah saldo
                                                dompet owner.
                                            </p>
                                        )}
                                        {currentType ===
                                            "store_transfer_in" && (
                                            <p className="text-xs text-emerald-600 mt-1">
                                                Transfer akan menambah saldo kas
                                                toko dan mengurangi saldo dompet
                                                owner.
                                            </p>
                                        )}
                                    </div>

                                    {currentType !== "raw_material" &&
                                        totalAmount > 0 && (
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">
                                                    Total
                                                </p>
                                                <p
                                                    className={`text-xl font-bold ${totalAmount > currentBalance && !isEditing ? "text-red-600" : "text-primary"}`}
                                                >
                                                    {fmt(totalAmount)}
                                                </p>
                                            </div>
                                        )}
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
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditing ? "Simpan" : "Simpan"}
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
