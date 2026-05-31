import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/layouts/dashboard/AppLayout";
import ProductForm from "../_components/ProductForm";

export default function EditProductPage({ product, categories }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.error) toast.error(flash.error);
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    return (
        <>
            <Head title={`Edit ${product.name}`} />
            <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <ProductForm product={product} categories={categories} />
            </div>
            <Toaster position="top-right" />
        </>
    );
}

EditProductPage.layout = (page) => <AppLayout>{page}</AppLayout>;
