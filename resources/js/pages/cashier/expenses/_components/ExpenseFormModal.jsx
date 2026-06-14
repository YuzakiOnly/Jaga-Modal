import { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Loader2,
    Package,
    Users,
    FileText,
    Wallet,
    AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

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
import { Alert, AlertDescription } from "@/components/ui/alert";

const EXPENSE_TYPES = [
    { value: "simple", label: "Simple", icon: FileText },
    { value: "raw_material", label: "Bahan Baku", icon: Package },
    { value: "salary", label: "Gaji", icon: Users },
];

const OWNER_EXPENSE_TYPES = [
    { value: "simple", label: "Simple", icon: FileText },
    { value: "raw_material", label: "Bahan Baku", icon: Package },
    { value: "salary", label: "Gaji", icon: Users },
    { value: "owner_withdrawal", label: "Penarikan Owner", icon: Wallet },
];

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

export default function ExpenseFormModal({
    open,
    onOpenChange,
    date,
    onSuccess,
    storeCashBalance = 0,
    editTarget = null,
}) {
    const { auth, storeCashBalance: globalBalance } = usePage().props;
    const isOwner = auth?.user?.role === "owner";
    const expenseTypes = isOwner ? OWNER_EXPENSE_TYPES : EXPENSE_TYPES;
    const isEdit = !!editTarget;

    const currentBalance = storeCashBalance ?? globalBalance ?? 0;

    const [type, setType] = useState("simple");
    const [form, setForm] = useState({
        description: "",
        amount: "",
        quantity: "",
        unit_price: "",
        employee_name: "",
        salary_period: "",
        note: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                    note: editTarget.notes || "",
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
                    note: "",
                });
            }
            setErrors({});
            setIsSubmitting(false);
            setBalanceWarning(null);
        }
    }, [open, editTarget]);

    useEffect(() => {
        if (!isEdit && open) {
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

            if (amountToCheck > 0 && amountToCheck > currentBalance) {
                setBalanceWarning({
                    amount: amountToCheck,
                    balance: currentBalance,
                    deficit: amountToCheck - currentBalance,
                });
            } else {
                setBalanceWarning(null);
            }
        }
    }, [
        form.amount,
        form.quantity,
        form.unit_price,
        type,
        open,
        isEdit,
        currentBalance,
    ]);

    const calculateTotal = () => {
        if (type === "raw_material" && form.quantity && form.unit_price) {
            return parseFloat(form.quantity) * parseFloat(form.unit_price);
        }
        return parseFloat(form.amount) || 0;
    };

    const handleSubmit = () => {
        const newErrors = {};

        if (!form.description.trim())
            newErrors.description = "Deskripsi wajib diisi";

        let expenseAmount = 0;

        if (type === "raw_material") {
            const qty = parseFloat(form.quantity);
            const price = parseFloat(form.unit_price);
            if (!form.quantity || qty <= 0)
                newErrors.quantity = "Jumlah harus lebih dari 0";
            if (!form.unit_price || price <= 0)
                newErrors.unit_price = "Harga satuan harus lebih dari 0";
            if (qty > 0 && price > 0) {
                expenseAmount = qty * price;
            }
        } else if (type === "salary") {
            if (!form.employee_name.trim())
                newErrors.employee_name = "Nama karyawan wajib diisi";
            if (!form.salary_period.trim())
                newErrors.salary_period = "Periode wajib diisi";
            if (!form.amount || parseFloat(form.amount) <= 0)
                newErrors.amount = "Jumlah gaji harus lebih dari 0";
            expenseAmount = parseFloat(form.amount) || 0;
        } else if (type === "owner_withdrawal") {
            if (!form.amount || parseFloat(form.amount) <= 0) {
                newErrors.amount = "Jumlah penarikan harus lebih dari 0";
            }
            expenseAmount = parseFloat(form.amount) || 0;
        } else {
            if (!form.amount || parseFloat(form.amount) <= 0)
                newErrors.amount = "Jumlah harus lebih dari 0";
            expenseAmount = parseFloat(form.amount) || 0;
        }

        if (!isEdit && expenseAmount > currentBalance) {
            newErrors.amount = `Saldo kas toko tidak mencukupi! Saldo saat ini: ${fmt(currentBalance)}`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        const formattedDate = format(date, "yyyy-MM-dd");

        const payload = {
            type: type,
            description: form.description,
            expensed_at: formattedDate,
            notes: form.note,
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
            ? route("cashier.expenses.update", editTarget.id)
            : route("cashier.expenses.store");
        const method = isEdit ? "put" : "post";

        router[method](url, payload, {
            onSuccess: () => {
                onOpenChange(false);
                setIsSubmitting(false);
                setErrors({});
                if (onSuccess) onSuccess();
            },
            onError: (e) => {
                setErrors(e);
                setIsSubmitting(false);
            },
        });
    };

    const totalAmount = calculateTotal();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-lg rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-base sm:text-lg">
                        {isEdit
                            ? "Edit Pengeluaran"
                            : "Tambah Pengeluaran Baru"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Edit data pengeluaran yang sudah dicatat"
                            : "Isi form berikut untuk mencatat pengeluaran baru"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                    {!isEdit &&
                        currentBalance < 100000 &&
                        currentBalance > 0 && (
                            <Alert className="bg-yellow-50 border-yellow-200">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                <AlertDescription className="text-yellow-700 text-sm">
                                    Saldo kas toko menipis:{" "}
                                    {fmt(currentBalance)}
                                </AlertDescription>
                            </Alert>
                        )}

                    {!isEdit && currentBalance <= 0 && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Saldo kas toko habis! Tidak dapat mencatat
                                pengeluaran baru.
                            </AlertDescription>
                        </Alert>
                    )}

                    {balanceWarning && !isEdit && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="space-y-1">
                                <p className="font-semibold">
                                    Saldo Tidak Cukup!
                                </p>
                                <p className="text-sm">
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

                    <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-xs sm:text-sm">
                            Tipe Pengeluaran
                        </Label>
                        <div
                            className={`grid grid-cols-2 gap-2 sm:gap-3 ${isOwner ? "md:grid-cols-4" : "md:grid-cols-3"}`}
                        >
                            {expenseTypes.map(
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
                                            currentBalance <= 0 &&
                                            value !== "owner_withdrawal"
                                        }
                                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                                            type === value
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50"
                                        } ${!isEdit && currentBalance <= 0 && value !== "owner_withdrawal" ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-xs font-medium">
                                            {label}
                                        </span>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs sm:text-sm">
                            Deskripsi <span className="text-red-500">*</span>
                        </Label>
                        <Input
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
                            className="text-sm"
                        />
                        {errors.description && (
                            <p className="text-[10px] sm:text-xs text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {type === "raw_material" && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs sm:text-sm">
                                        Jumlah{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Contoh: 10"
                                        value={form.quantity}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                quantity: e.target.value,
                                            })
                                        }
                                        className="text-sm"
                                    />
                                    {errors.quantity && (
                                        <p className="text-[10px] sm:text-xs text-red-500">
                                            {errors.quantity}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs sm:text-sm">
                                        Harga Satuan{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Contoh: 5000"
                                        value={form.unit_price}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                unit_price: e.target.value,
                                            })
                                        }
                                        className="text-sm"
                                    />
                                    {errors.unit_price && (
                                        <p className="text-[10px] sm:text-xs text-red-500">
                                            {errors.unit_price}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {form.quantity && form.unit_price && (
                                <div
                                    className={`text-xs sm:text-sm font-semibold p-2 sm:p-2.5 rounded-lg text-center ${
                                        totalAmount > currentBalance && !isEdit
                                            ? "bg-red-50 text-red-600"
                                            : "bg-emerald-50 text-emerald-600"
                                    }`}
                                >
                                    Total: {fmt(totalAmount)}
                                    {totalAmount > currentBalance &&
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
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs sm:text-sm">
                                        Nama Karyawan{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Ahmad Santoso"
                                        value={form.employee_name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                employee_name: e.target.value,
                                            })
                                        }
                                        className="text-sm"
                                    />
                                    {errors.employee_name && (
                                        <p className="text-[10px] sm:text-xs text-red-500">
                                            {errors.employee_name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs sm:text-sm">
                                        Periode{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Mei 2026"
                                        value={form.salary_period}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                salary_period: e.target.value,
                                            })
                                        }
                                        className="text-sm"
                                    />
                                    {errors.salary_period && (
                                        <p className="text-[10px] sm:text-xs text-red-500">
                                            {errors.salary_period}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs sm:text-sm">
                                    Jumlah Gaji{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Contoh: 5000000"
                                    value={form.amount}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            amount: e.target.value,
                                        })
                                    }
                                    className="text-sm"
                                />
                                {errors.amount && (
                                    <p className="text-[10px] sm:text-xs text-red-500">
                                        {errors.amount}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {(type === "simple" || type === "owner_withdrawal") && (
                        <div className="space-y-1">
                            <Label className="text-xs sm:text-sm">
                                {type === "owner_withdrawal"
                                    ? "Jumlah Penarikan"
                                    : "Jumlah"}{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={form.amount}
                                onChange={(e) =>
                                    setForm({ ...form, amount: e.target.value })
                                }
                                className="text-sm"
                            />
                            {errors.amount && (
                                <p className="text-[10px] sm:text-xs text-red-500">
                                    {errors.amount}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label className="text-xs sm:text-sm">
                            Catatan (opsional)
                        </Label>
                        <Input
                            placeholder="Tambahkan catatan..."
                            value={form.note}
                            onChange={(e) =>
                                setForm({ ...form, note: e.target.value })
                            }
                            className="text-sm"
                        />
                    </div>

                    {type !== "raw_material" && totalAmount > 0 && (
                        <div
                            className={`text-xs sm:text-sm font-semibold text-right ${
                                totalAmount > currentBalance && !isEdit
                                    ? "text-red-600"
                                    : "text-emerald-600"
                            }`}
                        >
                            Total: {fmt(totalAmount)}
                        </div>
                    )}

                    <div className="bg-slate-50 border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">
                            Saldo kas toko saat ini:{" "}
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
                        {type === "owner_withdrawal" && isOwner && (
                            <p className="text-xs text-amber-600 mt-1">
                                Penarikan akan mengurangi saldo kas toko dan
                                menambah saldo dompet owner.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto text-sm"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            (!isEdit && (currentBalance <= 0 || balanceWarning))
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-sm"
                    >
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        )}
                        {isEdit ? "Simpan Perubahan" : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
