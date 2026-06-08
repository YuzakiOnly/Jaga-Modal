import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/dashboard/AppLayout";
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
    PlusCircle,
    Tags,
    CheckCircle2,
    CircleDashed,
    Loader2,
    Wallet,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { CapitalTable } from "./_components/CapitalTable";
import { CapitalList } from "./_components/CapitalList";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { useSmartRefresh } from "@/hooks/useSmartRefresh";
import { refreshConfigs } from "@/hooks/refreshConfig";

export default function CapitalPricePage({ templates, filters }) {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [loading, setLoading] = useState(false);
    const { flash } = usePage().props;
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    useSmartRefresh({ ...refreshConfigs.owner_capital_price });

    const data = templates?.data ?? [];
    const totalCount = templates?.total ?? data.length ?? 0;
    const activeCount = data.filter((tpl) => tpl.is_active).length;
    const inactiveCount = data.filter((tpl) => !tpl.is_active).length;
    const totalAmount = data.reduce(
        (sum, tpl) => sum + (parseFloat(tpl.amount) || 0),
        0,
    );

    const formatRupiah = (value) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    const handleSearch = (value) => {
        setLoading(true);
        router.get(
            route("owner.capital-prices"),
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
            route("owner.capital-prices"),
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
            <Head title="Template HPP" />

            <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Template HPP
                        </h1>
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    <Button
                        onClick={() =>
                            router.visit(route("owner.capital-prices.create"))
                        }
                        className="h-9 w-9 p-0 sm:h-10 sm:w-auto sm:px-4"
                    >
                        <PlusCircle className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">
                            Tambah Template
                        </span>
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <Card className="shadow-none! h-full">
                        <CardHeader className="p-4 sm:p-5">
                            <CardDescription className="text-xs sm:text-sm">
                                Total Template
                            </CardDescription>
                            <CardTitle className="font-display text-xl sm:text-2xl lg:text-3xl">
                                {totalCount}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <Tags className="h-3 w-3" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-none! h-full">
                        <CardHeader className="p-4 sm:p-5">
                            <CardDescription className="text-xs sm:text-sm">
                                Template Aktif
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

                    <Card className="shadow-none! h-full">
                        <CardHeader className="p-4 sm:p-5">
                            <CardDescription className="text-xs sm:text-sm">
                                Template Nonaktif
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

                    <Card className="shadow-none! h-full">
                        <CardHeader className="p-4 sm:p-5">
                            <CardDescription className="text-xs sm:text-sm">
                                Total Nilai HPP
                            </CardDescription>
                            <CardTitle className="font-display text-lg sm:text-xl lg:text-2xl truncate">
                                {formatRupiah(totalAmount)}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <Wallet className="h-3 w-3" />
                                </Badge>
                            </CardAction>
                        </CardHeader>
                    </Card>
                </div>

                <div className="pt-2 sm:pt-4">
                    {isMobile ? (
                        <CapitalList
                            templates={templates}
                            filters={filters}
                            onDelete={setDeleteTarget}
                            onSearch={handleSearch}
                            onFilterChange={handleStatusChange}
                        />
                    ) : (
                        <CapitalTable
                            templates={templates}
                            filters={filters}
                            onDelete={setDeleteTarget}
                            onSearch={handleSearch}
                            onFilterChange={handleStatusChange}
                        />
                    )}
                </div>
            </div>

            <DeleteDialog
                item={deleteTarget}
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                routeName="owner.capital-prices.destroy"
                title="Hapus Template HPP"
                label="Hapus Template HPP"
                meta={
                    <>
                        <p className="text-sm font-medium text-destructive">
                            Template yang akan dihapus:{" "}
                            <span className="font-bold">
                                {deleteTarget?.name}
                            </span>
                        </p>
                        {deleteTarget?.product_name && (
                            <p className="text-xs text-muted-foreground">
                                Produk: {deleteTarget.product_name}
                            </p>
                        )}
                        {deleteTarget?.amount && (
                            <p className="text-xs text-muted-foreground font-mono">
                                HPP:{" "}
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                }).format(deleteTarget.amount)}
                            </p>
                        )}
                    </>
                }
            />
            <Toaster position="top-right" richColors />
        </>
    );
}

CapitalPricePage.layout = (page) => <AppLayout>{page}</AppLayout>;
