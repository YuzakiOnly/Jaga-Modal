import { useState, useEffect } from "react";
import { route } from "ziggy-js";
import { Head, router, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import { VariantGroupTable } from "./_components/VariantGroupTable";
import { VariantGroupList } from "./_components/VariantGroupList";
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
    LayoutList,
    Layers,
    CheckCircle2,
    CircleDashed,
    Loader2,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { useDeviceType } from "@/hooks/use-mobile";
import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";

export default function VariantGroupsPage({ variantGroups, filters, counts }) {
    const [deleteItem, setDeleteItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const { flash } = usePage().props;
    const deviceType = useDeviceType();

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useSmartRefresh({ ...refreshConfigs.owner_categories });

    const totalCount = counts?.total ?? 0;
    const activeCount = counts?.active ?? 0;
    const inactiveCount = counts?.inactive ?? 0;

    const handleSearch = (value) => {
        setLoading(true);
        router.get(
            route("owner.variant-groups"),
            { search: value, status: filters?.status || "all" },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    const handleStatusChange = (value) => {
        setLoading(true);
        router.get(
            route("owner.variant-groups"),
            { search: filters?.search || "", status: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <>
            <Head title="Owner — Variant Groups" />
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Variant Groups
                        </h1>
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    <Button
                        onClick={() =>
                            router.visit(route("owner.variant-groups.create"))
                        }
                        className="h-9 w-9 p-0 sm:h-10 sm:w-auto sm:px-4"
                    >
                        <LayoutList className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">
                            Add Variant Group
                        </span>
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-6">
                            <CardDescription>Total</CardDescription>
                            <CardTitle className="font-display text-2xl">
                                {totalCount}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline" className="p-2">
                                    <Layers className="h-3.5 w-3.5" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-6">
                            <CardDescription>Active</CardDescription>
                            <CardTitle className="font-display text-2xl">
                                {activeCount}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline" className="p-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-none">
                        <CardHeader className="p-4 sm:p-6">
                            <CardDescription>Inactive</CardDescription>
                            <CardTitle className="font-display text-2xl">
                                {inactiveCount}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline" className="p-2">
                                    <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </div>

                {deviceType !== "desktop" ? (
                    <VariantGroupList
                        variantGroups={variantGroups}
                        filters={filters}
                        onDelete={setDeleteItem}
                        onSearch={handleSearch}
                        onFilterChange={handleStatusChange}
                        deviceType={deviceType}
                    />
                ) : (
                    <VariantGroupTable
                        variantGroups={variantGroups}
                        filters={filters}
                        onDelete={setDeleteItem}
                        onSearch={handleSearch}
                        onFilterChange={handleStatusChange}
                    />
                )}
            </div>

            <DeleteDialog
                item={deleteItem}
                open={!!deleteItem}
                onOpenChange={(open) => !open && setDeleteItem(null)}
                routeName="owner.variant-groups.destroy"
                title="Delete Variant Group"
                label="Delete Variant Group"
                meta={
                    <>
                        <p className="text-sm font-medium text-destructive">
                            Variant group to delete:{" "}
                            <span className="font-bold wrap-break-word">
                                {deleteItem?.name}
                            </span>
                        </p>
                        {deleteItem?.products_count > 0 && (
                            <p className="text-xs text-destructive/70">
                                ⚠️ This variant group is linked to{" "}
                                {deleteItem.products_count} product
                                {deleteItem.products_count !== 1 ? "s" : ""}.
                            </p>
                        )}
                    </>
                }
            />
            <Toaster position="top-right" richColors />
        </>
    );
}

VariantGroupsPage.layout = (page) => <AppLayout>{page}</AppLayout>;
