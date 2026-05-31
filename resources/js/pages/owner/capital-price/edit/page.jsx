import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import TemplateForm from "../_components/CapitalForm";

export default function EditCapitalPricePage({ template }) {
    return (
        <>
            <Head title={`Edit ${template.name}`} />
            <div className="mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-8">
                <TemplateForm template={template} />
            </div>
        </>
    );
}

EditCapitalPricePage.layout = (page) => <AppLayout>{page}</AppLayout>;
