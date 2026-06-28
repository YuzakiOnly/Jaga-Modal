import { ArrowUpDown, MoreHorizontal, Trash2, Phone } from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

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

const roleLabel = (role) => {
    if (role === "cashier") return "Cashier";
    return role;
};

export const columns = (onDelete) => [
    {
        accessorKey: "name",
        enableHiding: false,
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2"
            >
                <span>Employee</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <p className="text-sm font-medium max-w-[200px] truncate">
                    {row.original.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono max-w-[160px] truncate">
                    @{row.original.username}
                </p>
            </div>
        ),
    },
    {
        accessorKey: "phone",
        header: () => <span className="text-sm">Phone</span>,
        cell: ({ row }) => {
            const phone = row.getValue("phone");
            return phone ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {phone}
                </span>
            ) : (
                <span className="text-muted-foreground/40 text-sm">—</span>
            );
        },
    },
    {
        accessorKey: "role",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2"
            >
                <span>Role</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize text-xs">
                {roleLabel(row.getValue("role"))}
            </Badge>
        ),
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2"
            >
                <span>Joined</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-sm whitespace-nowrap">
                {new Date(row.getValue("created_at")).toLocaleDateString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    },
                )}
            </span>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        header: () => <div className="text-center text-sm">Actions</div>,
        cell: ({ row }) => {
            const employee = row.original;

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
                                Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete(employee)}
                                className="gap-2 text-sm text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
