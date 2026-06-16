import {
    Package,
    Users,
    FileText,
    Wallet,
    MoreVertical,
    Pencil,
    Trash2,
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

const fmt = (n) => "Rp " + Math.round(n || 0).toLocaleString("id-ID");

const TYPE_CONFIG = {
    raw_material: {
        icon: Package,
        iconClass: "text-blue-500",
        label: "Bahan Baku",
        badgeVariant: "default",
    },
    salary: {
        icon: Users,
        iconClass: "text-green-500",
        label: "Gaji",
        badgeVariant: "success",
    },
    owner_withdrawal: {
        icon: Wallet,
        iconClass: "text-purple-500",
        label: "Penarikan Owner",
        badgeVariant: "destructive",
    },
    simple: {
        icon: FileText,
        iconClass: "text-gray-500",
        label: "Simple",
        badgeVariant: "secondary",
    },
};

const TypeIcon = ({ type }) => {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.simple;
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 ${config.iconClass}`} />;
};

const TypeBadge = ({ type }) => {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.simple;
    return <Badge variant={config.badgeVariant}>{config.label}</Badge>;
};

const getDetailText = (expense) => {
    if (
        expense.type === "raw_material" &&
        expense.quantity &&
        expense.unit_price
    ) {
        return `${expense.quantity} × ${fmt(expense.unit_price)}`;
    }
    if (expense.type === "salary" && expense.employee_name) {
        return `${expense.employee_name} · ${expense.salary_period}`;
    }
    if (expense.type === "owner_withdrawal") {
        return "Penarikan ke dompet owner";
    }
    if (expense.notes) {
        return expense.notes.length > 50
            ? expense.notes.slice(0, 50) + "..."
            : expense.notes;
    }
    return null;
};

const ActionMenu = ({ expense, onEdit, onDelete }) => (
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

export function ExpenseTable({ expenses, onEdit, onDelete }) {
    const data = expenses?.data ?? [];

    if (data.length === 0) {
        return (
            <div className="text-center py-10 sm:py-12 text-muted-foreground border rounded-lg text-sm">
                Belum ada data pengeluaran
            </div>
        );
    }

    return (
        <>
            <div className="sm:hidden space-y-2">
                {data.map((expense) => {
                    const detail = getDetailText(expense);
                    return (
                        <div
                            key={expense.id}
                            className="border rounded-lg p-3 bg-card flex items-start justify-between gap-2"
                        >
                            <div className="flex items-start gap-2.5 min-w-0">
                                <div className="mt-0.5 shrink-0">
                                    <TypeIcon type={expense.type} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">
                                        {expense.description}
                                    </p>
                                    {detail && (
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {detail}
                                        </p>
                                    )}
                                    <div className="mt-1.5">
                                        <TypeBadge type={expense.type} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="font-semibold text-sm text-rose-600 whitespace-nowrap">
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

            <div className="hidden sm:block border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-28 md:w-36">Tipe</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead className="hidden md:table-cell">
                                Detail
                            </TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                            <TableHead className="text-right w-16">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 md:gap-2">
                                        <TypeIcon type={expense.type} />
                                        <TypeBadge type={expense.type} />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-sm">
                                    {expense.description}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {getDetailText(expense) ? (
                                        <span className="text-sm text-muted-foreground">
                                            {getDetailText(expense)}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground italic">
                                            -
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-rose-600 text-sm whitespace-nowrap">
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}