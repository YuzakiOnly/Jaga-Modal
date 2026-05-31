import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import UserForm from "../_components/UserForm";

export default function CreateUserPage() {
    return (
        <>
            <Head title="Users — Create User" />
            <div className="mx-auto max-w-5xl py-8">
                <UserForm isEdit={false} />
            </div>
        </>
    );
}

CreateUserPage.layout = (page) => <AppLayout>{page}</AppLayout>;
