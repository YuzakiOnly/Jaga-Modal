import { useState, useEffect } from "react";
import { route } from "ziggy-js";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { ProductTable } from "./_components/ProductTable";
import { ProductList } from "./_components/ProductList";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    PackagePlus,
    Package,
    CheckCircle2,
    CircleDashed,
    AlertTriangle,
    Loader2,
    PackageSearch,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { AddStockDialog } from "./_components/AddStockDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ProductsPage({ products, categories, filters }) {
    const [deleteProduct, setDeleteProduct] = useState(null);
    const [addStockOpen, setAddStockOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { flash } = usePage().props;
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const data = products?.data ?? [];
    const totalCount = products?.total ?? 0;
    const activeCount = data.filter((p) => p.is_active).length;
    const inactiveCount = data.filter((p) => !p.is_active).length;
    const lowStockCount = data.filter(
        (p) =>
            p.stock_type === "limited" &&
            p.minimum_stock != null &&
            p.stock != null &&
            p.stock <= p.minimum_stock,
    ).length;

    const refetch = (params) => {
        setLoading(true);
        router.get(route("owner.products"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleSearch = (value) => refetch({ ...filters, search: value });
    const handleStatusChange = (value) =>
        refetch({ ...filters, status: value });
    const handleCategoryChange = (value) =>
        refetch({ ...filters, category_id: value });

    return (
        <>
            <Head title="Products" />

            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Products
                        </h1>
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setAddStockOpen(true)}
                            className="h-9 w-9 p-0 sm:h-10 sm:w-auto sm:px-4"
                        >
                            <PackageSearch className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">
                                Tambah Stok
                            </span>
                        </Button>

                        <Button
                            onClick={() =>
                                router.visit(route("owner.products.create"))
                            }
                            className="h-9 w-9 p-0 sm:h-10 sm:w-auto sm:px-4"
                        >
                            <PackagePlus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">
                                Add Product
                            </span>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-5">
                            <CardDescription className="text-xs sm:text-sm">
                                Total Products
                            </CardDescription>
                            <CardTitle className="font-display text-xl sm:text-2xl lg:text-3xl">
                                {totalCount}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <Package className="h-3 w-3" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-5">
                            <CardDescription className="text-xs sm:text-sm">
                                Active
                            </CardDescription>
                            <CardTitle className="font-display text-xl sm:text-2xl lg:text-3xl">
                                {activeCount}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-5">
                            <CardDescription className="text-xs sm:text-sm">
                                Inactive
                            </CardDescription>
                            <CardTitle className="font-display text-xl sm:text-2xl lg:text-3xl">
                                {inactiveCount}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <CircleDashed className="h-3 w-3 text-muted-foreground" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-5">
                            <CardDescription className="text-xs sm:text-sm">
                                Low Stock
                            </CardDescription>
                            <CardTitle
                                className={`font-display text-xl sm:text-2xl lg:text-3xl ${lowStockCount > 0 ? "text-destructive" : ""}`}
                            >
                                {lowStockCount}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <AlertTriangle
                                        className={`h-3 w-3 ${lowStockCount > 0 ? "text-destructive" : "text-muted-foreground"}`}
                                    />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </div>

                <div className="pt-2 sm:pt-4">
                    {isMobile ? (
                        <ProductList
                            products={products}
                            categories={categories}
                            filters={filters}
                            onDelete={setDeleteProduct}
                            onSearch={handleSearch}
                            onFilterChange={handleStatusChange}
                            onCategoryChange={handleCategoryChange}
                        />
                    ) : (
                        <ProductTable
                            products={products}
                            categories={categories}
                            filters={filters}
                            onDelete={setDeleteProduct}
                            onSearch={handleSearch}
                            onFilterChange={handleStatusChange}
                            onCategoryChange={handleCategoryChange}
                        />
                    )}
                </div>
            </div>

            <AddStockDialog
                open={addStockOpen}
                onOpenChange={setAddStockOpen}
                products={data}
            />

            <DeleteDialog
                item={deleteProduct}
                open={!!deleteProduct}
                onOpenChange={(open) => !open && setDeleteProduct(null)}
                routeName="owner.products.destroy"
                title="Delete Product"
                label="Delete Product"
                meta={
                    <>
                        <p className="text-sm font-medium text-destructive">
                            Product to delete:{" "}
                            <span className="font-bold">
                                {deleteProduct?.name}
                            </span>
                        </p>
                        {deleteProduct?.sku && (
                            <p className="text-xs text-muted-foreground font-mono">
                                SKU: {deleteProduct.sku}
                            </p>
                        )}
                    </>
                }
            />
            <Toaster position="top-right" richColors />
        </>
    );
}

ProductsPage.layout = (page) => <AppLayout>{page}</AppLayout>;
