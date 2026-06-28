import { useState } from "react";
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
import { EditDialog } from "./EditDialog";
import { DeleteDialog } from "@/components/shared/DeleteDialog";

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
        <span className="text-xs text-muted-foreground truncate max-w-30">
            {SOURCE_LABELS[source] || source}
        </span>
    </div>
);

const ActionMenu = ({ transaction, onEdit, onDelete }) => {
    const isWithdrawal = transaction.source === "withdrawal";
    const isStoreTransfer = transaction.source === "store_transfer";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => onEdit(transaction)}
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

export function WalletTable({ transactions }) {
    const { data, links, meta } = transactions;

    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    const handleEditClick = (transaction) => {
        if (transaction.source === "withdrawal") {
            toast.error("Transaksi dari penarikan toko tidak bisa diedit.");
            return;
        }
        setEditItem(transaction);
        setEditOpen(true);
    };

    const handleDeleteClick = (transaction) => {
        if (transaction.source === "withdrawal") {
            toast.error(
                "Transaksi dari penarikan toko hanya bisa dihapus dari halaman Pengeluaran.",
            );
            return;
        }
        setDeleteItem(transaction);
        setDeleteOpen(true);
    };

    if (data.length === 0) {
        return (
            <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-12 sm:py-16 text-center gap-3">
                <PiggyBank className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground text-sm">
                    Belum ada transaksi dompet
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground/60">
                    Tarik saldo dari toko atau tambah saldo manual
                </p>
            </div>
        );
    }

    const Pagination = () =>
        meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between border-t px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-muted-foreground">
                <span>
                    {meta.from}–{meta.to} dari {meta.total} transaksi
                </span>
                <div className="flex gap-1">
                    {links.prev ? (
                        <Link
                            href={links.prev}
                            preserveScroll
                            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                        >
                            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Link>
                    ) : (
                        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border opacity-40 cursor-not-allowed">
                            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                    )}
                    {links.next ? (
                        <Link
                            href={links.next}
                            preserveScroll
                            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border hover:bg-accent transition-colors"
                        >
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Link>
                    ) : (
                        <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border opacity-40 cursor-not-allowed">
                            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                    )}
                </div>
            </div>
        ) : null;

    const deleteMeta = deleteItem ? (
        <>
            <p className="text-sm">
                <span className="font-semibold">Deskripsi:</span>{" "}
                {deleteItem.description}
            </p>
            <p className="text-sm">
                <span className="font-semibold">Jumlah:</span>{" "}
                <span
                    className={
                        deleteItem.flow === "in"
                            ? "text-green-600"
                            : "text-rose-600"
                    }
                >
                    {deleteItem.flow === "in" ? "+" : "-"}{" "}
                    {fmt(deleteItem.amount)}
                </span>
            </p>
            <p className="text-sm">
                <span className="font-semibold">Tanggal:</span>{" "}
                {formatDate(deleteItem.transacted_at)}
            </p>
            {deleteItem.source === "store_transfer" && (
                <p className="text-sm text-amber-600">
                    ⚠️ Data di Kas Toko juga akan dihapus.
                </p>
            )}
        </>
    ) : null;

    return (
        <>
            <div className="border overflow-hidden bg-background">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-24 sm:w-28">
                                    Tanggal
                                </TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead className="min-w-25">
                                    Deskripsi
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Sumber
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
                            {data.map((transaction) => (
                                <TableRow
                                    key={transaction.id}
                                    className={
                                        transaction.source === "store_transfer"
                                            ? "bg-blue-50/30 dark:bg-blue-950/20"
                                            : ""
                                    }
                                >
                                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                                        {formatDate(transaction.transacted_at)}
                                    </TableCell>
                                    <TableCell>
                                        <FlowBadge
                                            flow={transaction.flow}
                                            source={transaction.source}
                                        />
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <SourceLabel
                                            source={transaction.source}
                                        />
                                        {transaction.expense_id && (
                                            <Link
                                                href={route("owner.expenses")}
                                                className="inline-flex items-center gap-1 ml-2 text-xs text-primary hover:underline"
                                            >
                                                <LinkIcon className="h-3 w-3" />
                                                Lihat
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={`font-semibold tabular-nums whitespace-nowrap text-sm ${
                                                transaction.flow === "in"
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400"
                                            }`}
                                        >
                                            {transaction.flow === "in"
                                                ? "+"
                                                : "-"}
                                            {fmt(transaction.amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionMenu
                                            transaction={transaction}
                                            onEdit={handleEditClick}
                                            onDelete={handleDeleteClick}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Pagination />
            </div>

            <EditDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                transaction={editItem}
            />

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                item={deleteItem}
                routeName="owner.wallet.destroy"
                title={
                    deleteItem?.source === "store_transfer"
                        ? "Hapus Transfer ke Toko"
                        : "Hapus Transaksi"
                }
                label="Hapus"
                meta={deleteMeta}
            />
        </>
    );
}
