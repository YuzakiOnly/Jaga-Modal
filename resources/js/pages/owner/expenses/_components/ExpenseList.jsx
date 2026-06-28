// ExpenseList.jsx - perbaiki urutan, tanggal setelah tipe
import {
    Package,
    Users,
    FileText,
    Wallet,
    MoreVertical,
    Pencil,
    Trash2,
    ArrowLeftRight,
    Lock,
    Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

const TYPE_CONFIG = {
    raw_material: {
        icon: Package,
        iconClass: "text-blue-500 dark:text-blue-400",
        label: "Bahan Baku",
        badgeVariant: "default",
        isIncome: false,
    },
    salary: {
        icon: Users,
        iconClass: "text-green-500 dark:text-green-400",
        label: "Gaji",
        badgeVariant: "success",
        isIncome: false,
    },
    owner_withdrawal: {
        icon: Wallet,
        iconClass: "text-purple-500 dark:text-purple-400",
        label: "Penarikan Owner",
        badgeVariant: "destructive",
        isIncome: false,
    },
    simple: {
        icon: FileText,
        iconClass: "text-gray-500 dark:text-gray-400",
        label: "Simple",
        badgeVariant: "secondary",
        isIncome: false,
    },
    store_transfer_in: {
        icon: ArrowLeftRight,
        iconClass: "text-emerald-500 dark:text-emerald-400",
        label: "Transfer Masuk",
        badgeVariant: "outline",
        isIncome: true,
    },
};

const TypeIcon = ({ type }) => {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.simple;
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.iconClass}`} />;
};

const TypeBadge = ({ type, isFromWallet }) => {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.simple;

    if (type === "store_transfer_in" && isFromWallet) {
        return (
            <Badge
                variant="outline"
                className="border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
            >
                Transfer dari Wallet Owner
            </Badge>
        );
    }

    if (type === "store_transfer_in") {
        return (
            <Badge
                variant="outline"
                className="border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
            >
                Transfer Masuk
            </Badge>
        );
    }

    if (config.isIncome) {
        return (
            <Badge
                variant="outline"
                className="border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
            >
                {config.label}
            </Badge>
        );
    }
    return <Badge variant={config.badgeVariant}>{config.label}</Badge>;
};

const getDisplayText = (expense) => {
    if (expense.type === "store_transfer_in" && expense.is_from_wallet) {
        return {
            detail: `Transfer dari Wallet Owner`,
            description: expense.wallet_description || expense.description,
            isFromWallet: true,
        };
    }

    if (expense.type === "store_transfer_in") {
        return {
            detail: "Transfer Manual",
            description: expense.description,
            isFromWallet: false,
        };
    }

    let detail = null;
    if (
        expense.type === "raw_material" &&
        expense.quantity &&
        expense.unit_price
    ) {
        detail = `${expense.quantity} × ${fmt(expense.unit_price)}`;
    } else if (expense.type === "salary" && expense.employee_name) {
        detail = `${expense.employee_name} · ${expense.salary_period}`;
    } else if (expense.type === "owner_withdrawal") {
        detail = "Penarikan ke dompet owner";
    } else if (expense.notes) {
        detail = expense.notes;
    }

    return {
        detail: detail,
        description: expense.description,
        isFromWallet: false,
    };
};

const ActionMenu = ({ expense, onEdit, onDelete }) => {
    const isProtected =
        expense.type === "store_transfer_in" && expense.is_from_wallet === true;

    if (isProtected) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-50 cursor-not-allowed"
                disabled
            >
                <Lock className="h-4 w-4 text-muted-foreground" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => onEdit(expense)}
                    className="cursor-pointer"
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDelete(expense)}
                    className="cursor-pointer text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function ExpenseList({ expenses, onEdit, onDelete }) {
    const data = expenses?.data ?? [];

    if (data.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border rounded-lg text-sm">
                Belum ada data transaksi
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {data.map((expense) => {
                const config = TYPE_CONFIG[expense.type] || TYPE_CONFIG.simple;
                const isIncome = config.isIncome;
                const isProtected =
                    expense.type === "store_transfer_in" &&
                    expense.is_from_wallet === true;
                const display = getDisplayText(expense);

                return (
                    <div
                        key={expense.id}
                        className={`border rounded-lg p-3 bg-card flex items-start justify-between gap-2 ${
                            isIncome
                                ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-950/20"
                                : ""
                        } ${isProtected ? "border-blue-200 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-950/20" : ""}`}
                    >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="mt-0.5 shrink-0">
                                <TypeIcon type={expense.type} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-muted-foreground">
                                            {expense.expensed_at
                                                ? format(
                                                      new Date(
                                                          expense.expensed_at,
                                                      ),
                                                      "dd MMM yyyy",
                                                      { locale: id },
                                                  )
                                                : "-"}
                                        </span>
                                        <TypeBadge
                                            type={expense.type}
                                            isFromWallet={display.isFromWallet}
                                        />
                                    </div>
                                    <p className="font-medium text-sm truncate max-w-[160px]">
                                        {display.description}
                                    </p>
                                    {display.detail && (
                                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                                            {display.detail}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                                className={`font-semibold text-sm whitespace-nowrap ${
                                    isIncome
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-rose-600 dark:text-rose-400"
                                }`}
                            >
                                {isIncome ? "+" : ""}
                                {fmt(expense.amount)}
                            </span>
                            <ActionMenu
                                expense={expense}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
