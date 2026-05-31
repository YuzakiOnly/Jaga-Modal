import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

export const columns = (onDelete) => [
    {
        accessorKey: "sort_order",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2"
            >
                <span>#</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground tabular-nums">
                {row.getValue("sort_order")}
            </span>
        ),
        enableHiding: false,
    },
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
                <span>Category</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col">
                <p className="text-sm font-medium max-w-[200px] truncate">
                    {row.original.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono max-w-[160px] truncate">
                    {row.original.slug}
                </p>
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: () => <span className="text-sm">Description</span>,
        cell: ({ row }) => {
            const desc = row.getValue("description");
            return desc ? (
                <span className="text-sm text-muted-foreground line-clamp-2 max-w-[240px]">
                    {desc}
                </span>
            ) : (
                <span className="text-muted-foreground/40 text-sm">—</span>
            );
        },
    },
    {
        accessorKey: "products_count",
        header: () => <span className="text-sm">Products</span>,
        cell: ({ row }) => {
            const count = row.getValue("products_count");
            if (count == null)
                return (
                    <span className="text-muted-foreground/40 text-sm">—</span>
                );
            return (
                <Badge variant="secondary" className="tabular-nums text-xs">
                    {count}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: ({ column }) => (
            <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2"
            >
                <span>Status</span>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
            </Button>
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("is_active");

            const handleToggle = () => {
                router.patch(
                    route("owner.categories.toggle", row.original.id),
                    {},
                    { preserveScroll: true },
                );
            };

            return (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={isActive}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                    <span
                        className={`text-xs ${isActive ? "text-emerald-600" : "text-muted-foreground"}`}
                    >
                        {isActive ? "Active" : "Inactive"}
                    </span>
                </div>
            );
        },
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
                <span>Created</span>
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
            const category = row.original;
            const productsCount = category.products_count ?? 0;
            const canDelete = productsCount === 0;

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
                                onClick={() =>
                                    router.visit(
                                        route(
                                            "owner.categories.edit",
                                            category.id,
                                        ),
                                    )
                                }
                                className="gap-2 text-sm"
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </DropdownMenuItem>

                            {canDelete ? (
                                <DropdownMenuItem
                                    onClick={() => onDelete(category)}
                                    className="gap-2 text-sm text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground opacity-50">
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                        <p className="text-xs">
                                            Remove all {productsCount} product
                                            {productsCount !== 1
                                                ? "s"
                                                : ""}{" "}
                                            first
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
