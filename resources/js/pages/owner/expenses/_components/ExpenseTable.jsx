// ExpenseTable.jsx - perbaiki urutan kolom
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

export function ExpenseTable({ expenses, onEdit, onDelete }) {
    const data = expenses?.data ?? [];

    if (data.length === 0) {
        return (
            <div className="text-center py-10 sm:py-12 text-muted-foreground border text-sm">
                Belum ada data transaksi
            </div>
        );
    }

    return (
        <div className="border overflow-hidden bg-background">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-28 md:w-36">Tipe</TableHead>
                            <TableHead className="whitespace-nowrap">
                                Tanggal
                            </TableHead>
                            <TableHead className="hidden md:table-cell min-w-[120px]">
                                Detail
                            </TableHead>
                            <TableHead className="min-w-[120px]">
                                Deskripsi
                            </TableHead>
                            <TableHead className="text-right whitespace-nowrap">
                                Jumlah
                            </TableHead>
                            <TableHead className="text-right w-16">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((expense) => {
                            const config =
                                TYPE_CONFIG[expense.type] || TYPE_CONFIG.simple;
                            const isIncome = config.isIncome;
                            const isProtected =
                                expense.type === "store_transfer_in" &&
                                expense.is_from_wallet === true;
                            const display = getDisplayText(expense);

                            return (
                                <TableRow
                                    key={expense.id}
                                    className={`${isIncome ? "bg-emerald-50/30 dark:bg-emerald-950/20" : ""} ${isProtected ? "bg-blue-50/30 dark:bg-blue-950/20" : ""}`}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <TypeIcon type={expense.type} />
                                            <TypeBadge
                                                type={expense.type}
                                                isFromWallet={
                                                    display.isFromWallet
                                                }
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-sm">
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
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell max-w-[200px]">
                                        <span className="block truncate max-w-[200px] text-muted-foreground">
                                            {display.detail || "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <span className="block truncate max-w-[200px] font-medium">
                                            {display.description}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className={`text-right font-semibold text-sm whitespace-nowrap ${
                                            isIncome
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-rose-600 dark:text-rose-400"
                                        }`}
                                    >
                                        {isIncome ? "+" : ""}
                                        {fmt(expense.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionMenu
                                            expense={expense}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
