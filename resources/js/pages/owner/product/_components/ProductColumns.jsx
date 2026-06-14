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

const formatPrice = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

export const columns = (onDelete) => [
    {
        accessorKey: "name",
        enableHiding: false,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2 sm:px-3 h-8 text-xs sm:text-sm"
            >
                Product
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const image = row.original.image;
            return (
                <div className="flex items-center gap-2 sm:gap-3">
                    {image ? (
                        <img
                            src={`/storage/${image}`}
                            alt={row.original.name}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover shrink-0 border"
                        />
                    ) : (
                        <span className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg shrink-0 flex items-center justify-center bg-muted text-muted-foreground text-xs font-bold border">
                            {row.original.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                    <div>
                        <p className="text-xs sm:text-sm font-medium truncate max-w-30 sm:max-w-50 md:max-w-none">
                            {row.original.name}
                        </p>
                        {row.original.sku && (
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono hidden sm:block">
                                SKU: {row.original.sku}
                            </p>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "category",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2 sm:px-3 h-8 text-xs sm:text-sm hidden sm:flex"
            >
                Category
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const cat = row.original.category;
            return cat ? (
                <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs hidden sm:inline-flex"
                >
                    {cat.name}
                </Badge>
            ) : (
                <span className="text-muted-foreground/40 text-xs hidden sm:inline">
                    —
                </span>
            );
        },
    },
    {
        accessorKey: "selling_price",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2 sm:px-3 h-8 text-xs sm:text-sm"
            >
                Price
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-medium tabular-nums block">
                    {formatPrice(row.getValue("selling_price"))}
                </span>
                {row.original.enable_online_food && (
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                        {row.original.price_gobiz &&
                            `GoBiz ${formatPrice(row.original.price_gobiz)}`}
                        {row.original.price_grabfood &&
                            ` | Grab ${formatPrice(row.original.price_grabfood)}`}
                        {row.original.price_shopeefood &&
                            ` | Shopee ${formatPrice(row.original.price_shopeefood)}`}
                    </span>
                )}
            </div>
        ),
    },
    {
        accessorKey: "stock",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2 sm:px-3 h-8 text-xs sm:text-sm"
            >
                Stock
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const stockType = row.original.stock_type;
            const stock = row.getValue("stock");
            const minStock = row.original.minimum_stock;
            const unit = row.original.unit;
            const isLow =
                stockType === "limited" &&
                minStock != null &&
                stock != null &&
                stock <= minStock;

            if (stockType === "unlimited") {
                return (
                    <Badge
                        variant="secondary"
                        className="text-[10px] sm:text-xs"
                    >
                        Unlimited
                    </Badge>
                );
            }

            return (
                <span
                    className={`text-xs sm:text-sm tabular-nums font-medium ${isLow ? "text-destructive" : ""}`}
                >
                    {stock ?? 0} {unit}
                    {isLow && (
                        <span className="ml-1 text-[10px] sm:text-xs text-destructive hidden sm:inline">
                            {" "}
                            ⚠ Low
                        </span>
                    )}
                </span>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2 sm:px-3 h-8 text-xs sm:text-sm hidden md:flex"
            >
                Status
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const isActive = row.getValue("is_active");

            const handleToggle = () => {
                router.patch(
                    route("owner.products.toggle", row.original.id),
                    {},
                    { preserveScroll: true },
                );
            };

            return (
                <div className="flex items-center gap-1 sm:gap-2">
                    <Switch
                        checked={isActive}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-emerald-500 scale-75 sm:scale-100"
                    />
                    <span
                        className={`text-[10px] sm:text-xs ${isActive ? "text-emerald-600" : "text-muted-foreground"} hidden sm:inline`}
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
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
                className="px-2 sm:px-3 h-8 text-xs sm:text-sm hidden lg:flex"
            >
                Added
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
        ),
        cell: ({ row }) => (
            <span className="text-[10px] sm:text-xs hidden lg:inline">
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
        header: () => (
            <div className="text-center text-xs sm:text-sm">Actions</div>
        ),
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 ring-0 hover:bg-transparent"
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
                                onClick={() =>
                                    router.visit(
                                        route(
                                            "owner.products.edit",
                                            product.id,
                                        ),
                                    )
                                }
                                className="gap-2 text-xs sm:text-sm"
                            >
                                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(product)}
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
