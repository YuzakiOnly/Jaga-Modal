import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import VariantGroupForm from "../_components/VariantGroupForm";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { toast } from "sonner";

export default function EditVariantGroupPage({ variantGroup, products }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    return (
        <>
            <Head title={`Owner — Edit ${variantGroup.name}`} />
            <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <div className="space-y-4">
                    <VariantGroupForm
                        variantGroup={variantGroup}
                        products={products}
                    />
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </>
    );
}

EditVariantGroupPage.layout = (page) => <AppLayout>{page}</AppLayout>;
