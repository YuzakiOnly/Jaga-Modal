import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import UserForm from "../_components/UserForm";

export default function EditUserPage({ user }) {
    return (
        <>
            <Head title={`Users — Edit ${user.name}`} />
            <div className="mx-auto max-w-5xl py-8">
                <UserForm user={user} isEdit={true} />
            </div>
        </>
    );
}

EditUserPage.layout = (page) => <AppLayout>{page}</AppLayout>;
