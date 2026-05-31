import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import TemplateForm from "../_components/CapitalForm";

export default function CreateCapitalPricePage() {
    return (
        <>
            <Head title="Tambah Template HPP" />
            <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-8">
                <TemplateForm />
            </div>
        </>
    );
}

CreateCapitalPricePage.layout = (page) => <AppLayout>{page}</AppLayout>;
