import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Link as LinkIcon,
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react";
import { Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const SOURCE_LABELS = {
    withdrawal: "Penarikan dari Toko",
    manual_topup: "Topup Manual",
    personal_out: "Pengeluaran Pribadi",
    store_transfer: "Transfer ke Toko",
};

export const FlowBadge = ({ flow, source }) => {
    if (source === "store_transfer") {
        return (
            <Badge
                variant="outline"
                className="border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
            >
                Transfer ke Toko
            </Badge>
        );
    }

    if (flow === "in") {
        return (
            <Badge variant="success" className="gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                Masuk
            </Badge>
        );
    }
    return (
        <Badge variant="destructive" className="gap-1 text-xs">
            <TrendingDown className="h-3 w-3" />
            Keluar
        </Badge>
    );
};

export const SourceLabel = ({ source }) => (
    <div className="flex items-center gap-1">
        <Wallet className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground truncate max-w-30">
            {SOURCE_LABELS[source] || source}
        </span>
    </div>
);

export const ActionMenu = ({ transaction, onDelete }) => {
    const isWithdrawal = transaction.source === "withdrawal";
    const isStoreTransfer = transaction.source === "store_transfer";

    const handleEdit = () => {
        if (isWithdrawal) {
            toast.error("Transaksi dari penarikan toko tidak bisa diedit.");
            return;
        }
        router.get(route("owner.wallet.edit", transaction.id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={handleEdit}
                    className="cursor-pointer"
                    disabled={isWithdrawal}
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                    {isStoreTransfer && (
                        <span className="ml-2 text-[10px] text-muted-foreground">
                            (update Kas Toko)
                        </span>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDelete(transaction)}
                    className={`cursor-pointer ${!isWithdrawal ? "text-destructive focus:text-destructive" : ""}`}
                    disabled={isWithdrawal}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                    {isStoreTransfer && (
                        <span className="ml-2 text-[10px] text-muted-foreground">
                            (hapus data toko)
                        </span>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const walletColumns = (onDelete) => [
    {
        accessorKey: "transacted_at",
        header: "Tanggal",
        cell: ({ row }) => (
            <span className="whitespace-nowrap text-muted-foreground text-sm">
                {formatDate(row.getValue("transacted_at"))}
            </span>
        ),
    },
    {
        accessorKey: "flow",
        header: "Tipe",
        cell: ({ row }) => {
            const transaction = row.original;
            return (
                <FlowBadge
                    flow={transaction.flow}
                    source={transaction.source}
                />
            );
        },
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => {
            const transaction = row.original;
            return (
                <div>
                    <p className="font-medium text-sm truncate max-w-45">
                        {transaction.description}
                    </p>
                    {transaction.notes && (
                        <p className="text-xs text-muted-foreground truncate max-w-45 mt-0.5">
                            {transaction.notes}
                        </p>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "source",
        header: "Sumber",
        cell: ({ row }) => {
            const transaction = row.original;
            return (
                <div className="hidden md:block">
                    <SourceLabel source={transaction.source} />
                    {transaction.expense_id && (
                        <Link
                            href={route("owner.expenses")}
                            className="inline-flex items-center gap-1 ml-2 text-xs text-primary hover:underline"
                        >
                            <LinkIcon className="h-3 w-3" />
                            Lihat
                        </Link>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Jumlah</div>,
        cell: ({ row }) => {
            const transaction = row.original;
            return (
                <div className="text-right">
                    <span
                        className={`font-semibold tabular-nums whitespace-nowrap text-sm ${
                            transaction.flow === "in"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                        }`}
                    >
                        {transaction.flow === "in" ? "+" : "-"}
                        {fmt(transaction.amount)}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => {
            const transaction = row.original;
            return (
                <div className="text-right">
                    <ActionMenu transaction={transaction} onDelete={onDelete} />
                </div>
            );
        },
    },
];
