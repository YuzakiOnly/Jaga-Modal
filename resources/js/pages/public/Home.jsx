import LanguageSelector from "@/components/language/LanguageSelector";
import { Link, useForm, usePage } from "@inertiajs/react";

export default function Home() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const { post, processing } = useForm({});

    const handleLogout = () => {
        post("/logout");
    };

    return (
        <div className="p-6 space-y-4">
            <LanguageSelector />

            <h1 className="text-red-500 text-2xl font-bold">Dashboard</h1>

            {user ? (
                <div className="border rounded-lg p-4 space-y-2 max-w-sm">
                    <p>
                        <span className="font-semibold">Nama:</span> {user.name}
                    </p>
                    <p>
                        <span className="font-semibold">Username:</span> @
                        {user.username}
                    </p>
                    <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {user.email}
                    </p>
                    <p>
                        <span className="font-semibold">No. HP:</span>{" "}
                        {user.phone}
                    </p>
                    <p>
                        <span className="font-semibold">Role:</span> {user.role}
                    </p>
                    <p>
                        <span className="font-semibold">Locale:</span>{" "}
                        {user.locale}
                    </p>

                    <button
                        onClick={handleLogout}
                        disabled={processing}
                        className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
                    >
                        {processing ? "Logging out..." : "Logout"}
                    </button>
                </div>
            ) : (
                <div className="space-x-2">
                    <span className="text-gray-500">Belum login.</span>
                    <Link href="/login" className="text-blue-500 underline">
                        Login
                    </Link>
                </div>
            )}

            <Link href="/login" className="text-blue-500 underline block">
                Tambah Baranefefg
            </Link>
        </div>
    );
}
