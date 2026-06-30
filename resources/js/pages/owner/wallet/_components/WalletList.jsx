import {
    PiggyBank,
    TrendingUp,
    TrendingDown,
    Wallet,
    Link as LinkIcon,
    MoreVertical,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
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

const FlowBadge = ({ flow, source }) => {
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

const SourceLabel = ({ source }) => (
    <div className="flex items-center gap-1">
        <Wallet className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            {SOURCE_LABELS[source] || source}
        </span>
    </div>
);

const ActionMenu = ({ transaction, onDelete }) => {
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

export function WalletList({ transactions, onDelete }) {
    const { data, links, meta } = transactions;

    if (data.length === 0) {
        return (
            <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-12 text-center gap-3">
                <PiggyBank className="h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground text-sm">
                    Belum ada transaksi dompet
                </p>
                <p className="text-xs text-muted-foreground/60">
                    Tarik saldo dari toko atau tambah saldo manual
                </p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg bg-card overflow-hidden">
            <div className="divide-y">
                {data.map((transaction) => (
                    <div
                        key={transaction.id}
                        className={`p-3 flex items-start justify-between gap-2 ${
                            transaction.source === "store_transfer"
                                ? "bg-blue-50/30 dark:bg-blue-950/20"
                                : ""
                        }`}
                    >
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <FlowBadge
                                    flow={transaction.flow}
                                    source={transaction.source}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(transaction.transacted_at)}
                                </span>
                            </div>
                            <p className="font-medium text-sm truncate max-w-[160px] mt-1">
                                {transaction.description}
                            </p>
                            {transaction.notes && (
                                <p className="text-xs text-muted-foreground truncate max-w-[160px] mt-0.5">
                                    {transaction.notes}
                                </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                                <SourceLabel source={transaction.source} />
                                {transaction.expense_id && (
                                    <Link
                                        href={route("owner.expenses")}
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                        <LinkIcon className="h-3 w-3" />
                                        Lihat di Kas Toko
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <span
                                className={`font-semibold tabular-nums text-sm whitespace-nowrap ${
                                    transaction.flow === "in"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-rose-600 dark:text-rose-400"
                                }`}
                            >
                                {transaction.flow === "in" ? "+" : "-"}
                                {fmt(transaction.amount)}
                            </span>
                            <ActionMenu
                                transaction={transaction}
                                onDelete={onDelete}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between border-t px-3 py-2.5 text-xs text-muted-foreground">
                    <span>
                        {meta.from}–{meta.to} dari {meta.total} transaksi
                    </span>
                    <div className="flex gap-1">
                        {links.prev ? (
                            <Link
                                href={links.prev}
                                preserveScroll
                                className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Link>
                        ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-md border opacity-40 cursor-not-allowed">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </span>
                        )}
                        {links.next ? (
                            <Link
                                href={links.next}
                                preserveScroll
                                className="flex h-7 w-7 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-md border opacity-40 cursor-not-allowed">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
