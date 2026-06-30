import {
    ArrowUpDown,
    MoreHorizontal,
    Pencil,
    Trash2,
    Lock,
    Calendar,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

const TYPE_CONFIG = {
    raw_material: {
        label: "Bahan Baku",
        badgeVariant: "default",
        isIncome: false,
    },
    salary: {
        label: "Gaji",
        badgeVariant: "success",
        isIncome: false,
    },
    owner_withdrawal: {
        label: "Penarikan Owner",
        badgeVariant: "destructive",
        isIncome: false,
    },
    simple: {
        label: "Simple",
        badgeVariant: "secondary",
        isIncome: false,
    },
    store_transfer_in: {
        label: "Transfer Masuk",
        badgeVariant: "outline",
        isIncome: true,
    },
};

const TypeBadge = ({ type, isFromWallet }) => {
    if (type === "store_transfer_in" && isFromWallet) {
        return (
            <Badge
                variant="outline"
                className="border-blue-500 text-blue-600 bg-blue-50"
            >
                Transfer dari Wallet Owner
            </Badge>
        );
    }

    if (type === "store_transfer_in") {
        return (
            <Badge
                variant="outline"
                className="border-emerald-500 text-emerald-600 bg-emerald-50"
            >
                Transfer Masuk
            </Badge>
        );
    }

    const config = TYPE_CONFIG[type] || TYPE_CONFIG.simple;
    if (config.isIncome) {
        return (
            <Badge
                variant="outline"
                className="border-emerald-500 text-emerald-600 bg-emerald-50"
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
            detail: "Transfer dari Wallet Owner",
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

export const columns = (onDelete) => [
    {
        accessorKey: "expensed_at",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2"
            >
                <span>Tanggal</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm">
                    {row.getValue("expensed_at")
                        ? format(
                              new Date(row.getValue("expensed_at")),
                              "dd MMM yyyy",
                              { locale: id },
                          )
                        : "-"}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "type",
        header: () => <span className="text-sm">Tipe</span>,
        cell: ({ row }) => {
            const expense = row.original;
            const display = getDisplayText(expense);
            return (
                <TypeBadge
                    type={expense.type}
                    isFromWallet={display.isFromWallet}
                />
            );
        },
    },
    {
        accessorKey: "description",
        header: () => <span className="text-sm">Deskripsi</span>,
        cell: ({ row }) => {
            const expense = row.original;
            const display = getDisplayText(expense);
            return (
                <div className="flex flex-col">
                    <span className="text-sm font-medium max-w-[200px] truncate">
                        {display.description}
                    </span>
                    {display.detail && (
                        <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {display.detail}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2"
            >
                <span>Jumlah</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => {
            const expense = row.original;
            const config = TYPE_CONFIG[expense.type] || TYPE_CONFIG.simple;
            const isIncome = config.isIncome || false;
            return (
                <span
                    className={`font-semibold text-sm ${isIncome ? "text-emerald-600" : "text-rose-600"}`}
                >
                    {isIncome ? "+" : ""}
                    {fmt(row.getValue("amount"))}
                </span>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        header: () => <div className="text-center text-sm">Aksi</div>,
        cell: ({ row }) => {
            const expense = row.original;
            const isProtected =
                expense.type === "store_transfer_in" &&
                expense.is_from_wallet === true;

            if (isProtected) {
                return (
                    <div className="flex justify-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-50 cursor-not-allowed"
                                    disabled
                                >
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p className="text-xs">
                                    Tidak dapat diedit dari sini
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                );
            }

            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-sm">
                                Aksi
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() =>
                                    router.get(
                                        route(
                                            "owner.expenses.edit",
                                            expense.id,
                                        ),
                                    )
                                }
                                className="gap-2 text-sm"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(expense)}
                                className="gap-2 text-sm text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
