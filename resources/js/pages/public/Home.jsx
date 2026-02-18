import LanguageSelector from "@/components/language/LanguageSelector";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function Home() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [editMode, setEditMode] = useState(false);

    const { post: postLogout, processing: loggingOut } = useForm({});

    const {
        data,
        setData,
        put,
        processing: saving,
        errors,
        reset,
        wasSuccessful,
    } = useForm({
        name: user?.name ?? "",
        username: user?.username ?? "",
        phone: user?.phone ?? "",
        email: user?.email ?? "", 
    });

    const handleLogout = () => postLogout("/logout");

    const handleEdit = () => {
        setData({
            name: user?.name ?? "",
            username: user?.username ?? "",
            phone: user?.phone ?? "",
            email: user?.email ?? "",
        });
        setEditMode(true);
    };

    const handleCancel = () => {
        reset();
        setEditMode(false);
    };

    const handleSave = (e) => {
        e.preventDefault();
        put("/profile", {
            onSuccess: () => setEditMode(false),
        });
    };

    const isAdmin = user?.role === "admin";

    return (
        <div className="p-6 space-y-4">
            <LanguageSelector />
            <h1 className="text-red-500 text-2xl font-bold">Dashboard</h1>

            {user ? (
                <div className="border rounded-lg p-4 max-w-sm space-y-3">
                    {!editMode ? (
                        <>
                            <div className="space-y-2">
                                <Row label="Nama" value={user.name} />
                                <Row
                                    label="Username"
                                    value={`@${user.username}`}
                                />
                                <Row label="No. HP" value={user.phone} />
                                <Row label="Email" value={user.email} />
                                <Row label="Role" value={user.role} />
                            </div>

                            {wasSuccessful && (
                                <p className="text-xs text-green-600 font-medium">
                                    Profil berhasil diperbarui
                                </p>
                            )}

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleEdit}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded cursor-pointer"
                                >
                                    Edit Profil
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
                                >
                                    {loggingOut ? "..." : "Logout"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold block mb-1">
                                    Nama
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-semibold block mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) =>
                                        setData(
                                            "username",
                                            e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9_]/g, ""),
                                        )
                                    }
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                                {errors.username && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-semibold block mb-1">
                                    No. HP
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData(
                                            "phone",
                                            e.target.value.replace(/\D/g, ""),
                                        )
                                    }
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                                {errors.phone && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {isAdmin && (
                                <div>
                                    <label className="text-sm font-semibold block mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="bg-gray-50 rounded p-2 space-y-1">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                    Tidak dapat diubah
                                </p>
                                
                                {!isAdmin && (
                                    <Row
                                        label="Email"
                                        value={user.email}
                                        muted
                                    />
                                )}

                                <Row label="Role" value={user.role} muted />

                                <Row
                                    label="Locale"
                                    value={user.locale || "id"}
                                    muted
                                />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            ) : (
                <div className="space-x-2">
                    <span className="text-gray-500">Belum login.</span>
                    <Link href="/login" className="text-blue-500 underline">
                        Login
                    </Link>
                </div>
            )}
        </div>
    );
}

function Row({ label, value, muted = false }) {
    return (
        <p className={muted ? "text-sm text-gray-400" : "text-sm"}>
            <span className="font-semibold">{label}:</span> {value}
        </p>
    );
}
