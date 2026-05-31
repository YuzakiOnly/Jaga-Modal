import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price ?? 0);

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

export const columns = (onEdit, onDelete) => [
    {
        accessorKey: "expensed_at",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="text-xs sm:text-sm px-1 sm:px-2 h-8"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Date
                <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="tabular-nums text-muted-foreground whitespace-nowrap text-xs sm:text-sm">
                {formatDate(row.getValue("expensed_at"))}
            </span>
        ),
    },

    {
        accessorKey: "description",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="text-xs sm:text-sm px-1 sm:px-2 h-8"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Description
                <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const expense = row.original;
            return (
                <div className="max-w-[140px] sm:max-w-[220px]">
                    <p className="font-medium line-clamp-1 text-xs sm:text-sm">
                        {expense.description}
                    </p>
                    {expense.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 hidden sm:block">
                            {expense.notes}
                        </p>
                    )}
                </div>
            );
        },
    },

    {
        accessorKey: "category",
        id: "category",
        header: () => (
            <span className="text-xs sm:text-sm hidden md:inline">
                Category
            </span>
        ),
        cell: ({ row }) => {
            const category = row.original.category;
            if (!category) {
                return (
                    <span className="text-muted-foreground/40 hidden md:inline">
                        —
                    </span>
                );
            }
            return (
                <span
                    className="hidden md:inline-flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
                    style={{
                        backgroundColor: category.color + "20",
                        color: category.color,
                    }}
                >
                    <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                </span>
            );
        },
        filterFn: (row, _id, filterValue) => {
            if (!filterValue) return true;
            const catId = row.original.expense_category_id;
            return String(catId) === String(filterValue);
        },
    },

    {
        accessorKey: "amount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="text-xs sm:text-sm px-1 sm:px-2 h-8"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Amount
                <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="font-semibold tabular-nums text-destructive whitespace-nowrap text-xs sm:text-sm">
                {formatPrice(row.getValue("amount"))}
            </span>
        ),
    },

    {
        id: "actions",
        enableHiding: false,
        header: () => (
            <div className="text-center text-xs sm:text-sm">Actions</div>
        ),
        cell: ({ row }) => {
            const expense = row.original;
            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 ring-0! hover:bg-transparent!"
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-36 sm:w-40"
                        >
                            <DropdownMenuLabel className="text-xs sm:text-sm">
                                Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onEdit(expense)}
                                className="gap-2 text-xs sm:text-sm"
                            >
                                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(expense)}
                                className="gap-2 text-xs sm:text-sm text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
