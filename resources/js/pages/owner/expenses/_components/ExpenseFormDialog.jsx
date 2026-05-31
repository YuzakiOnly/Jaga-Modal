import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    Loader2,
    Package,
    Users,
    FileText,
    Wallet,
    Calendar as CalendarIcon,
    AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const EXPENSE_TYPES = [
    { value: "simple", label: "Simple", icon: FileText },
    { value: "raw_material", label: "Bahan Baku", icon: Package },
    { value: "salary", label: "Gaji", icon: Users },
    { value: "owner_withdrawal", label: "Penarikan Owner", icon: Wallet },
];

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export function ExpenseFormDialog({
    open,
    onOpenChange,
    editTarget,
    storeCashBalance,
}) {
    const isEdit = !!editTarget;
    const [type, setType] = useState("simple");
    const [form, setForm] = useState({
        description: "",
        amount: "",
        quantity: "",
        unit_price: "",
        employee_name: "",
        salary_period: "",
        expensed_at: new Date(),
        notes: "",
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [balanceWarning, setBalanceWarning] = useState(null);

    useEffect(() => {
        if (open) {
            if (editTarget) {
                setType(editTarget.type || "simple");
                setForm({
                    description: editTarget.description || "",
                    amount: editTarget.amount?.toString() || "",
                    quantity: editTarget.quantity?.toString() || "",
                    unit_price: editTarget.unit_price?.toString() || "",
                    employee_name: editTarget.employee_name || "",
                    salary_period: editTarget.salary_period || "",
                    expensed_at: editTarget.expensed_at
                        ? new Date(editTarget.expensed_at)
                        : new Date(),
                    notes: editTarget.notes || "",
                });
            } else {
                setType("simple");
                setForm({
                    description: "",
                    amount: "",
                    quantity: "",
                    unit_price: "",
                    employee_name: "",
                    salary_period: "",
                    expensed_at: new Date(),
                    notes: "",
                });
            }
            setErrors({});
            setProcessing(false);
            setBalanceWarning(null);
        }
    }, [open, editTarget]);

    const checkBalance = () => {
        let amountToCheck = 0;
        if (type === "raw_material") {
            const qty = parseFloat(form.quantity) || 0;
            const price = parseFloat(form.unit_price) || 0;
            amountToCheck = qty * price;
        } else if (
            type === "salary" ||
            type === "simple" ||
            type === "owner_withdrawal"
        ) {
            amountToCheck = parseFloat(form.amount) || 0;
        }
        if (amountToCheck > 0 && !isEdit && amountToCheck > storeCashBalance) {
            setBalanceWarning({
                amount: amountToCheck,
                balance: storeCashBalance,
                deficit: amountToCheck - storeCashBalance,
            });
        } else {
            setBalanceWarning(null);
        }
        return amountToCheck;
    };

    useEffect(() => {
        if (!isEdit && open) checkBalance();
    }, [form.amount, form.quantity, form.unit_price, type, open, isEdit]);

    const calculateTotal = () => {
        if (type === "raw_material" && form.quantity && form.unit_price) {
            return parseFloat(form.quantity) * parseFloat(form.unit_price);
        }
        return parseFloat(form.amount) || 0;
    };

    const handleSubmit = () => {
        setProcessing(true);
        setErrors({});

        const newErrors = {};
        const amountNum = parseFloat(form.amount) || 0;
        let expenseAmount = 0;

        if (!form.description.trim())
            newErrors.description = "Deskripsi wajib diisi";

        if (type === "raw_material") {
            const qty = parseFloat(form.quantity);
            const price = parseFloat(form.unit_price);
            if (!form.quantity || qty <= 0)
                newErrors.quantity = "Jumlah harus lebih dari 0";
            if (!form.unit_price || price <= 0)
                newErrors.unit_price = "Harga satuan harus lebih dari 0";
            if (qty > 0 && price > 0) expenseAmount = qty * price;
        } else if (type === "salary") {
            if (!form.employee_name.trim())
                newErrors.employee_name = "Nama karyawan wajib diisi";
            if (!form.salary_period.trim())
                newErrors.salary_period = "Periode wajib diisi";
            if (!form.amount || amountNum <= 0)
                newErrors.amount = "Jumlah gaji harus lebih dari 0";
            expenseAmount = amountNum;
        } else {
            if (!form.amount || amountNum <= 0)
                newErrors.amount = "Jumlah harus lebih dari 0";
            expenseAmount = amountNum;
        }

        if (!isEdit && expenseAmount > storeCashBalance) {
            newErrors.amount = `Saldo kas toko tidak mencukupi! Saldo saat ini: ${fmt(storeCashBalance)}`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setProcessing(false);
            return;
        }

        const payload = {
            type,
            description: form.description,
            expensed_at: format(form.expensed_at, "yyyy-MM-dd"),
            notes: form.notes,
            ...(type === "raw_material" && {
                quantity: form.quantity,
                unit_price: form.unit_price,
            }),
            ...(type === "salary" && {
                employee_name: form.employee_name,
                salary_period: form.salary_period,
                amount: form.amount,
            }),
            ...((type === "simple" || type === "owner_withdrawal") && {
                amount: form.amount,
            }),
        };

        const url = isEdit
            ? route("owner.expenses.update", editTarget.id)
            : route("owner.expenses.store");
        const method = isEdit ? "put" : "post";

        router[method](url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                setProcessing(false);
            },
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    };

    const totalAmount = calculateTotal();
    const showAmountField = type === "simple" || type === "owner_withdrawal";
    const showDetailLabel =
        type === "owner_withdrawal" ? "Jumlah Penarikan" : "Jumlah";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[calc(100vw-1rem)] max-w-lg max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-lg p-4 sm:p-6"
                aria-describedby="expense-form-description"
            >
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                        {isEdit
                            ? "Edit Pengeluaran"
                            : "Tambah Pengeluaran Baru"}
                    </DialogTitle>
                    <p
                        id="expense-form-description"
                        className="text-xs sm:text-sm text-muted-foreground"
                    >
                        {isEdit
                            ? "Edit data pengeluaran yang sudah dicatat"
                            : "Isi form berikut untuk mencatat pengeluaran baru"}
                    </p>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
                    {!isEdit &&
                        storeCashBalance < 100000 &&
                        storeCashBalance > 0 && (
                            <Alert
                                variant="warning"
                                className="bg-yellow-50 border-yellow-200 py-2.5 sm:py-3"
                            >
                                <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-700 text-xs sm:text-sm">
                                    Saldo kas toko menipis:{" "}
                                    {fmt(storeCashBalance)}
                                </AlertDescription>
                            </Alert>
                        )}

                    {!isEdit && storeCashBalance <= 0 && (
                        <Alert variant="destructive" className="py-2.5 sm:py-3">
                            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <AlertDescription className="text-xs sm:text-sm">
                                Saldo kas toko habis! Tidak dapat mencatat
                                pengeluaran baru.
                            </AlertDescription>
                        </Alert>
                    )}

                    {balanceWarning && !isEdit && (
                        <Alert variant="destructive" className="py-2.5 sm:py-3">
                            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <AlertDescription className="space-y-1 text-xs sm:text-sm">
                                <p className="font-semibold">
                                    Saldo Tidak Cukup!
                                </p>
                                <p>
                                    Pengeluaran: {fmt(balanceWarning.amount)}
                                    <br />
                                    Saldo tersedia:{" "}
                                    {fmt(balanceWarning.balance)}
                                    <br />
                                    <span className="text-red-600">
                                        Kekurangan:{" "}
                                        {fmt(balanceWarning.deficit)}
                                    </span>
                                </p>
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs sm:text-sm">
                            Tipe Pengeluaran
                        </Label>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                            {EXPENSE_TYPES.map(
                                ({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            setType(value);
                                            setErrors({});
                                            setBalanceWarning(null);
                                        }}
                                        disabled={
                                            !isEdit &&
                                            storeCashBalance <= 0 &&
                                            value !== "owner_withdrawal"
                                        }
                                        className={`flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-lg border transition-all ${
                                            type === value
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:border-primary/50 hover:bg-accent"
                                        } ${!isEdit && storeCashBalance <= 0 && value !== "owner_withdrawal" ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                                        <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                                            {label}
                                        </span>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">
                            Deskripsi{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            className="h-9 sm:h-10 text-sm"
                            placeholder={
                                type === "raw_material"
                                    ? "Contoh: Tepung terigu 25kg"
                                    : type === "salary"
                                      ? "Contoh: Gaji bulan Mei"
                                      : type === "owner_withdrawal"
                                        ? "Contoh: Penarikan untuk kebutuhan pribadi"
                                        : "Contoh: Beli ATK kantor"
                            }
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

                    {type === "raw_material" && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs sm:text-sm">
                                    Jumlah{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Contoh: 10"
                                    className="h-9 sm:h-10 text-sm"
                                    value={form.quantity}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            quantity: e.target.value,
                                        })
                                    }
                                />
                                {errors.quantity && (
                                    <p className="text-xs text-destructive">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs sm:text-sm">
                                    Harga Satuan{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Contoh: 5000"
                                    className="h-9 sm:h-10 text-sm"
                                    value={form.unit_price}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            unit_price: e.target.value,
                                        })
                                    }
                                />
                                {errors.unit_price && (
                                    <p className="text-xs text-destructive">
                                        {errors.unit_price}
                                    </p>
                                )}
                            </div>
                            {form.quantity && form.unit_price && (
                                <div
                                    className={`col-span-2 text-sm p-2 rounded-lg text-center ${
                                        totalAmount > storeCashBalance &&
                                        !isEdit
                                            ? "bg-red-50 text-red-700"
                                            : "bg-primary/10 text-primary"
                                    }`}
                                >
                                    Total: {fmt(totalAmount)}
                                    {totalAmount > storeCashBalance &&
                                        !isEdit && (
                                            <span className="block text-xs text-red-600 mt-1">
                                                Melebihi saldo!
                                            </span>
                                        )}
                                </div>
                            )}
                        </div>
                    )}

                    {type === "salary" && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs sm:text-sm">
                                        Nama Karyawan{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Ahmad Santoso"
                                        className="h-9 sm:h-10 text-sm"
                                        value={form.employee_name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                employee_name: e.target.value,
                                            })
                                        }
                                    />
                                    {errors.employee_name && (
                                        <p className="text-xs text-destructive">
                                            {errors.employee_name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs sm:text-sm">
                                        Periode{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Mei 2026"
                                        className="h-9 sm:h-10 text-sm"
                                        value={form.salary_period}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                salary_period: e.target.value,
                                            })
                                        }
                                    />
                                    {errors.salary_period && (
                                        <p className="text-xs text-destructive">
                                            {errors.salary_period}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs sm:text-sm">
                                    Jumlah Gaji{" "}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Contoh: 5000000"
                                    className="h-9 sm:h-10 text-sm"
                                    value={form.amount}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            amount: e.target.value,
                                        })
                                    }
                                />
                                {errors.amount && (
                                    <p className="text-xs text-destructive">
                                        {errors.amount}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {showAmountField && (
                        <div className="space-y-1.5">
                            <Label className="text-xs sm:text-sm">
                                {showDetailLabel}{" "}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                className="h-9 sm:h-10 text-sm"
                                value={form.amount}
                                onChange={(e) =>
                                    setForm({ ...form, amount: e.target.value })
                                }
                            />
                            {errors.amount && (
                                <p className="text-xs text-destructive">
                                    {errors.amount}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">
                            Tanggal <span className="text-destructive">*</span>
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal gap-2 h-9 sm:h-10 text-xs sm:text-sm"
                                >
                                    <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                    {form.expensed_at ? (
                                        format(form.expensed_at, "PPP", {
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
                                    selected={form.expensed_at}
                                    onSelect={(date) =>
                                        setForm({
                                            ...form,
                                            expensed_at: date || new Date(),
                                        })
                                    }
                                    initialFocus
                                    locale={id}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.expensed_at && (
                            <p className="text-xs text-destructive">
                                {errors.expensed_at}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs sm:text-sm">
                            Catatan (opsional)
                        </Label>
                        <Input
                            placeholder="Tambahkan catatan..."
                            className="h-9 sm:h-10 text-sm"
                            value={form.notes}
                            onChange={(e) =>
                                setForm({ ...form, notes: e.target.value })
                            }
                        />
                    </div>

                    <div className="bg-slate-50 border rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Saldo kas toko saat ini:{" "}
                            <strong
                                className={
                                    storeCashBalance <= 0
                                        ? "text-red-600"
                                        : "text-green-600"
                                }
                            >
                                {fmt(storeCashBalance)}
                            </strong>
                        </p>
                        {type === "owner_withdrawal" && (
                            <p className="text-xs text-amber-600 mt-1">
                                Penarikan akan mengurangi saldo kas toko dan
                                menambah saldo dompet owner.
                            </p>
                        )}
                    </div>

                    {type !== "raw_material" &&
                        totalAmount > 0 &&
                        type !== "owner_withdrawal" && (
                            <div
                                className={`text-xs sm:text-sm font-semibold text-right ${
                                    totalAmount > storeCashBalance && !isEdit
                                        ? "text-red-600"
                                        : "text-primary"
                                }`}
                            >
                                Total: {fmt(totalAmount)}
                            </div>
                        )}
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
                        disabled={
                            processing ||
                            (!isEdit &&
                                (storeCashBalance <= 0 ||
                                    (balanceWarning && !isEdit)))
                        }
                        className="w-full sm:w-auto h-9 sm:h-10 text-sm"
                    >
                        {processing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEdit ? "Simpan Perubahan" : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
