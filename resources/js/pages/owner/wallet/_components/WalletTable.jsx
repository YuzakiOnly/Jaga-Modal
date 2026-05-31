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
import { EditDialog } from "./EditDialog";

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const SOURCE_LABELS = {
    withdrawal: "Penarikan Toko",
    manual_topup: "Topup Manual",
    personal_out: "Pengeluaran Pribadi",
};

const FlowBadge = ({ flow }) => {
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
        <span className="text-xs text-muted-foreground">
            {SOURCE_LABELS[source] || source}
        </span>
    </div>
);

const ActionMenu = ({ transaction, onEdit, onDelete }) => (
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
                disabled={transaction.source === "withdrawal"}
            >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => onDelete(transaction)}
                className="cursor-pointer text-destructive focus:text-destructive"
                disabled={transaction.source === "withdrawal"}
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

export function WalletTable({ transactions }) {
    const { data, links, meta } = transactions;

    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

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

    const confirmDelete = () => {
        if (!deleteItem) return;
        setDeleteProcessing(true);
        router.delete(route("owner.wallet.destroy", deleteItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                setDeleteItem(null);
                setDeleteProcessing(false);
                toast.success("Transaksi berhasil dihapus.");
            },
            onError: () => {
                setDeleteProcessing(false);
                toast.error("Gagal menghapus transaksi.");
            },
        });
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

    return (
        <>
            <div className="sm:hidden border rounded-lg bg-card overflow-hidden">
                <div className="divide-y">
                    {data.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="p-3 flex items-start justify-between gap-2"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <FlowBadge flow={transaction.flow} />
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(transaction.transacted_at)}
                                    </span>
                                </div>
                                <p className="font-medium text-sm mt-1 truncate">
                                    {transaction.description}
                                </p>
                                {transaction.notes && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
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
                                            Lihat
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span
                                    className={`font-semibold tabular-nums text-sm whitespace-nowrap ${
                                        transaction.flow === "in"
                                            ? "text-green-600"
                                            : "text-rose-600"
                                    }`}
                                >
                                    {transaction.flow === "in" ? "+" : "-"}
                                    {fmt(transaction.amount)}
                                </span>
                                <ActionMenu
                                    transaction={transaction}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <Pagination />
            </div>

            <div className="hidden sm:block border bg-card overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-28">Tanggal</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Sumber
                                </TableHead>
                                <TableHead className="text-right">
                                    Jumlah
                                </TableHead>
                                <TableHead className="text-right w-16">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                                        {formatDate(transaction.transacted_at)}
                                    </TableCell>
                                    <TableCell>
                                        <FlowBadge flow={transaction.flow} />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {transaction.description}
                                            </p>
                                            {transaction.notes && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
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
                                                    ? "text-green-600"
                                                    : "text-rose-600"
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

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base sm:text-lg">
                            Hapus Transaksi
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    Transaksi ini akan dihapus secara permanen
                                    dan tidak dapat dikembalikan.
                                </p>
                                {deleteItem && (
                                    <div className="mt-2 pt-3 border-t space-y-1">
                                        <p className="text-sm text-foreground">
                                            <span className="font-semibold">
                                                Deskripsi:
                                            </span>{" "}
                                            {deleteItem.description}
                                        </p>
                                        <p className="text-sm text-foreground">
                                            <span className="font-semibold">
                                                Jumlah:
                                            </span>{" "}
                                            <span
                                                className={
                                                    deleteItem.flow === "in"
                                                        ? "text-green-600"
                                                        : "text-rose-600"
                                                }
                                            >
                                                {deleteItem.flow === "in"
                                                    ? "+"
                                                    : "-"}
                                                {fmt(deleteItem.amount)}
                                            </span>
                                        </p>
                                        <p className="text-sm text-foreground">
                                            <span className="font-semibold">
                                                Tanggal:
                                            </span>{" "}
                                            {formatDate(
                                                deleteItem.transacted_at,
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                        <AlertDialogCancel
                            disabled={deleteProcessing}
                            className="w-full sm:w-auto"
                        >
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteProcessing}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
