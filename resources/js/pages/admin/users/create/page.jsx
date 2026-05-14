import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/dashboard/AppLayout";
import CreateUserForm from "./_components/CreateUserForm";

export default function CreateUserPage() {
    return (
        <>
            <Head title="Admin — Create User" />
            <div className="mx-auto max-w-screen-lg pt-8">
                <div className="space-y-4">
                    <CreateUserForm />
                </div>
            </div>
        </>
    );
}

CreateUserPage.layout = (page) => <AppLayout>{page}</AppLayout>;
