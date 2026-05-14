import { Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import EditUserForm from "./_components/EditUserForm";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { toast } from "sonner";

export default function EditUserPage({ user }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    return (
        <>
            <Head title={`Admin — Edit ${user.name}`} />
            <div className="mx-auto max-w-5xl pt-8">
                <div className="space-y-4">
                    <EditUserForm user={user} />
                </div>
            </div>
            <Toaster position="top-right" />
        </>
    );
}

EditUserPage.layout = (page) => <AppLayout>{page}</AppLayout>;
