import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    Pencil,
    Trash2,
    Package,
    MoreVertical,
    AlertTriangle,
    FilterIcon,
    SearchIcon,
    X,
    ChevronDown,
    Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const formatPrice = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export function ProductList({
    products,
    categories,
    filters,
    onDelete,
    onSearch,
    onFilterChange,
    onCategoryChange,
    deviceType,
}) {
    const data = products?.data ?? [];
    const [loadingId, setLoadingId] = useState(null);
    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
    const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

    const handleToggleStatus = (productId) => {
        setLoadingId(productId);
        router.patch(
            route("owner.products.toggle", productId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setLoadingId(null),
            },
        );
    };

    const getStatusLabel = () =>
        statusOptions.find((s) => s.value === (filters?.status || "all"))
            ?.label || "Status";

    const getCategoryLabel = () => {
        if (!filters?.category_id) return "Category";
        return (
            categories.find((c) => String(c.id) === String(filters.category_id))
                ?.name || "Category"
        );
    };

    const isLowStock = (product) =>
        product.stock_type === "limited" &&
        product.minimum_stock != null &&
        product.stock != null &&
        product.stock <= product.minimum_stock;

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama atau SKU..."
                        value={filters?.search || ""}
                        onChange={(e) => onSearch(e.target.value)}
                        className="h-10 pl-9 pr-9 text-sm"
                    />
                    {filters?.search && (
                        <button
                            type="button"
                            onClick={() => onSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    <Popover
                        open={categoryPopoverOpen}
                        onOpenChange={setCategoryPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 justify-between text-xs"
                            >
                                <span className="truncate">
                                    {getCategoryLabel()}
                                </span>
                                <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0 max-h-60 overflow-y-auto">
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        onCategoryChange("");
                                        setCategoryPopoverOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent ${
                                        !filters?.category_id
                                            ? "bg-accent text-accent-foreground"
                                            : ""
                                    }`}
                                >
                                    All Categories
                                    {!filters?.category_id && (
                                        <Check className="h-3 w-3" />
                                    )}
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            onCategoryChange(cat.id);
                                            setCategoryPopoverOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent ${
                                            String(filters?.category_id) ===
                                            String(cat.id)
                                                ? "bg-accent text-accent-foreground"
                                                : ""
                                        }`}
                                    >
                                        {cat.name}
                                        {String(filters?.category_id) ===
                                            String(cat.id) && (
                                            <Check className="h-3 w-3" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Popover
                        open={statusPopoverOpen}
                        onOpenChange={setStatusPopoverOpen}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 justify-between text-xs"
                            >
                                <span className="truncate">
                                    {getStatusLabel()}
                                </span>
                                <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-0">
                            <div className="py-1">
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            onFilterChange(opt.value);
                                            setStatusPopoverOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent ${
                                            (filters?.status || "all") ===
                                            opt.value
                                                ? "bg-accent text-accent-foreground"
                                                : ""
                                        }`}
                                    >
                                        {opt.label}
                                        {(filters?.status || "all") ===
                                            opt.value &&
                                            opt.value !== "all" && (
                                                <Check className="h-3 w-3" />
                                            )}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {((filters?.status && filters.status !== "all") ||
                    filters?.category_id) && (
                    <div className="flex flex-wrap gap-1.5">
                        {filters?.category_id && (
                            <Badge
                                variant="secondary"
                                className="gap-1 text-xs px-2 py-0.5"
                            >
                                <FilterIcon className="h-2.5 w-2.5" />
                                {getCategoryLabel()}
                                <X
                                    className="h-2.5 w-2.5 cursor-pointer hover:text-destructive"
                                    onClick={() => onCategoryChange("")}
                                />
                            </Badge>
                        )}
                        {filters?.status && filters.status !== "all" && (
                            <Badge
                                variant="secondary"
                                className="gap-1 text-xs px-2 py-0.5"
                            >
                                <FilterIcon className="h-2.5 w-2.5" />
                                {getStatusLabel()}
                                <X
                                    className="h-2.5 w-2.5 cursor-pointer hover:text-destructive"
                                    onClick={() => onFilterChange("all")}
                                />
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <div
                className={`grid gap-2 ${deviceType === "tablet" ? "grid-cols-3" : "grid-cols-2"}`}
            >
                {data.length === 0 ? (
                    <div
                        className={`${deviceType === "tablet" ? "col-span-3" : "col-span-2"} flex items-center justify-center py-12 text-center`}
                    >
                        <div className="space-y-2">
                            <Package className="mx-auto h-8 w-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                                Tidak ada produk ditemukan
                            </p>
                        </div>
                    </div>
                ) : (
                    data.map((product) => {
                        const lowStock = isLowStock(product);
                        return (
                            <Card
                                key={product.id}
                                className="overflow-hidden shadow-sm"
                            >
                                <CardContent className="p-2">
                                    <div className="flex flex-col gap-2">
                                        {product.image ? (
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="h-24 w-full rounded-lg object-cover border"
                                            />
                                        ) : (
                                            <div className="h-24 w-full rounded-lg bg-muted flex items-center justify-center text-2xl font-bold border text-muted-foreground">
                                                {product.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-1">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xs font-medium truncate">
                                                        {product.name}
                                                    </h3>
                                                    {product.sku && (
                                                        <p className="text-[9px] text-muted-foreground font-mono truncate">
                                                            SKU: {product.sku}
                                                        </p>
                                                    )}
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 shrink-0 -mt-1 -mr-1"
                                                        >
                                                            <MoreVertical className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                router.visit(
                                                                    route(
                                                                        "owner.products.edit",
                                                                        product.id,
                                                                    ),
                                                                )
                                                            }
                                                            className="gap-2 text-xs"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onDelete(
                                                                    product,
                                                                )
                                                            }
                                                            className="gap-2 text-xs text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <p className="text-xs font-semibold text-primary mt-1">
                                                {formatPrice(
                                                    product.selling_price,
                                                )}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-1 mt-1">
                                                {product.category && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[8px] px-1 py-0"
                                                    >
                                                        {product.category.name}
                                                    </Badge>
                                                )}
                                                {lowStock && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-[8px] px-1 py-0 gap-0.5"
                                                    >
                                                        <AlertTriangle className="h-2 w-2" />
                                                        Low
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-1 border-t">
                                                <div>
                                                    <p className="text-[8px] text-muted-foreground">
                                                        Stok
                                                    </p>
                                                    <p
                                                        className={`text-[10px] font-medium tabular-nums ${lowStock ? "text-destructive" : ""}`}
                                                    >
                                                        {product.stock_type ===
                                                        "limited"
                                                            ? `${product.stock ?? 0} ${product.unit}`
                                                            : "∞"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Switch
                                                        checked={
                                                            product.is_active
                                                        }
                                                        onCheckedChange={() =>
                                                            handleToggleStatus(
                                                                product.id,
                                                            )
                                                        }
                                                        disabled={
                                                            loadingId ===
                                                            product.id
                                                        }
                                                        className="data-[state=checked]:bg-emerald-500 scale-75"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
                <div className="text-xs text-muted-foreground text-center">
                    Menampilkan {products?.from ?? 0} sampai {products?.to ?? 0}{" "}
                    dari {products?.total ?? 0} produk
                </div>
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (products?.prev_page_url) {
                                router.get(
                                    products.prev_page_url,
                                    {},
                                    { preserveState: true },
                                );
                            }
                        }}
                        disabled={!products?.prev_page_url}
                        className="h-8 text-xs"
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (products?.next_page_url) {
                                router.get(
                                    products.next_page_url,
                                    {},
                                    { preserveState: true },
                                );
                            }
                        }}
                        disabled={!products?.next_page_url}
                        className="h-8 text-xs"
                    >
                        Selanjutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
