import { useForm, usePage } from "@inertiajs/react";
import { useState, useRef } from "react";
import LanguageSelector from "@/components/language/LanguageSelector";
import { roleLabel } from "@/lib/auth/role";

// Helpers 
function storageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/storage/")) return path;
    return `/storage/${path}`;
}

const inputCls =
    "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

function Field({ label, error, children }) {
    return (
        <div>
            <label className="text-sm font-semibold block mb-1">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

function Row({ label, value, muted = false }) {
    return (
        <p className={muted ? "text-sm text-gray-400" : "text-sm"}>
            <span className="font-semibold">{label}:</span>{" "}
            {value ?? <span className="text-gray-400 italic">-</span>}
        </p>
    );
}

function ImagePreview({ src, size = 72, rounded = "rounded-full", fallback }) {
    const [err, setErr] = useState(false);
    if (src && !err) {
        return (
            <img
                src={src}
                alt="preview"
                onError={() => setErr(true)}
                className={`${rounded} object-cover border`}
                style={{ width: size, height: size }}
            />
        );
    }
    return (
        <div
            className={`${rounded} bg-gray-200 flex items-center justify-center border text-gray-500 font-bold text-lg`}
            style={{ width: size, height: size }}
        >
            {fallback?.[0]?.toUpperCase() ?? "?"}
        </div>
    );
}

function ImageInput({
    label,
    name,
    currentSrc,
    rounded = "rounded-lg",
    onChange,
}) {
    const ref = useRef();
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        onChange(name, file);
    };

    return (
        <div>
            <label className="text-sm font-semibold block mb-1">{label}</label>
            <div className="flex items-center gap-3">
                <ImagePreview
                    src={preview ?? currentSrc}
                    size={56}
                    rounded={rounded}
                    fallback="?"
                />
                <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    className="text-sm text-blue-500 underline cursor-pointer"
                >
                    {currentSrc || preview ? "Ganti" : "Upload"}
                </button>
                <input
                    ref={ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}

// Tab Profil 
function ProfileTab({ user }) {
    const [editMode, setEditMode] = useState(false);
    const canEdit = ["super_admin", "owner", "admin"].includes(user?.role);
    const canEditEmail = canEdit;

    const { data, setData, post, processing, errors, reset, wasSuccessful } =
        useForm({
            name: user?.name ?? "",
            username: user?.username ?? "",
            phone: user?.phone ?? "",
            email: user?.email ?? "",
            avatar: null,
        });

    const handleEdit = () => {
        setData({
            name: user?.name ?? "",
            username: user?.username ?? "",
            phone: user?.phone ?? "",
            email: user?.email ?? "",
            avatar: null,
        });
        setEditMode(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        post("/profile", {
            forceFormData: true,
            onSuccess: () => setEditMode(false),
        });
    };

    return (
        <div className="space-y-4">
            {!editMode ? (
                <>
                    <div className="flex items-center gap-4">
                        <ImagePreview
                            src={storageUrl(user?.avatar)}
                            size={72}
                            rounded="rounded-full"
                            fallback={user?.name}
                        />
                        <div>
                            <p className="font-bold text-lg">{user?.name}</p>
                            <p className="text-sm text-gray-500">
                                @{user?.username}
                            </p>
                            <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
                                {roleLabel(user?.role)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Row label="Email" value={user?.email} />
                        <Row label="No. HP" value={user?.phone} />
                        <Row label="Locale" value={user?.locale || "en"} />
                    </div>

                    {wasSuccessful && (
                        <p className="text-xs text-green-600 font-medium">
                            ✓ Profil berhasil diperbarui
                        </p>
                    )}

                    {canEdit && (
                        <button
                            onClick={handleEdit}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded cursor-pointer"
                        >
                            Edit Profil
                        </button>
                    )}
                </>
            ) : (
                <form onSubmit={handleSave} className="space-y-3">
                    <ImageInput
                        label="Foto Profil"
                        name="avatar"
                        currentSrc={storageUrl(user?.avatar)}
                        rounded="rounded-full"
                        onChange={(name, file) => setData(name, file)}
                    />

                    <Field label="Nama" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className={inputCls}
                            required
                        />
                    </Field>

                    <Field label="Username" error={errors.username}>
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
                            className={inputCls}
                            required
                        />
                    </Field>

                    <Field label="No. HP" error={errors.phone}>
                        <input
                            type="tel"
                            value={data.phone}
                            onChange={(e) =>
                                setData(
                                    "phone",
                                    e.target.value.replace(/\D/g, ""),
                                )
                            }
                            className={inputCls}
                        />
                    </Field>

                    {canEditEmail && (
                        <Field label="Email" error={errors.email}>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className={inputCls}
                                required
                            />
                        </Field>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setEditMode(false);
                            }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

// Tab Toko 
function StoreTab({ store }) {
    const [editMode, setEditMode] = useState(false);

    const { data, setData, post, processing, errors, reset, wasSuccessful } =
        useForm({
            name: store?.name ?? "",
            business_type: store?.business_type ?? "",
            country: store?.country ?? "ID",
            province: store?.province ?? "",
            address: store?.address ?? "",
            latitude: store?.latitude ?? "",
            longitude: store?.longitude ?? "",
            logo: null,
            thumbnail: null,
        });

    const handleEdit = () => {
        setData({
            name: store?.name ?? "",
            business_type: store?.business_type ?? "",
            country: store?.country ?? "ID",
            province: store?.province ?? "",
            address: store?.address ?? "",
            latitude: store?.latitude ?? "",
            longitude: store?.longitude ?? "",
            logo: null,
            thumbnail: null,
        });
        setEditMode(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        post("/store", {
            forceFormData: true,
            onSuccess: () => setEditMode(false),
        });
    };

    if (!store) {
        return (
            <p className="text-sm text-gray-500 italic">Belum ada data toko.</p>
        );
    }

    return (
        <div className="space-y-4">
            {!editMode ? (
                <>
                    <div className="flex items-center gap-4">
                        <ImagePreview
                            src={storageUrl(store?.logo)}
                            size={72}
                            rounded="rounded-lg"
                            fallback={store?.name}
                        />
                        <div>
                            <p className="font-bold text-lg">{store?.name}</p>
                            <p className="text-sm text-gray-500">
                                {store?.business_type}
                            </p>
                            <span
                                className={`inline-block mt-1 text-xs rounded-full px-2 py-0.5 font-medium ${store?.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                                {store?.is_active ? "Aktif" : "Tidak Aktif"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Row label="Negara" value={store?.country} />
                        <Row label="Provinsi" value={store?.province} />
                        <Row label="Alamat" value={store?.address} />
                        {store?.latitude && store?.longitude && (
                            <Row
                                label="Koordinat"
                                value={`${store.latitude}, ${store.longitude}`}
                            />
                        )}
                    </div>

                    {wasSuccessful && (
                        <p className="text-xs text-green-600 font-medium">
                            ✓ Toko berhasil diperbarui
                        </p>
                    )}

                    <button
                        onClick={handleEdit}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded cursor-pointer"
                    >
                        Edit Toko
                    </button>
                </>
            ) : (
                <form onSubmit={handleSave} className="space-y-3">
                    <ImageInput
                        label="Logo Toko"
                        name="logo"
                        currentSrc={storageUrl(store?.logo)}
                        rounded="rounded-lg"
                        onChange={(name, file) => setData(name, file)}
                    />
                    <ImageInput
                        label="Thumbnail Toko"
                        name="thumbnail"
                        currentSrc={storageUrl(store?.thumbnail)}
                        rounded="rounded-lg"
                        onChange={(name, file) => setData(name, file)}
                    />

                    <Field label="Nama Toko" error={errors.name}>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className={inputCls}
                            required
                        />
                    </Field>

                    <Field label="Jenis Bisnis" error={errors.business_type}>
                        <input
                            type="text"
                            value={data.business_type}
                            onChange={(e) =>
                                setData("business_type", e.target.value)
                            }
                            className={inputCls}
                            required
                        />
                    </Field>

                    <Field label="Negara" error={errors.country}>
                        <input
                            type="text"
                            value={data.country}
                            onChange={(e) => setData("country", e.target.value)}
                            className={inputCls}
                            required
                        />
                    </Field>

                    <Field label="Provinsi" error={errors.province}>
                        <input
                            type="text"
                            value={data.province}
                            onChange={(e) =>
                                setData("province", e.target.value)
                            }
                            className={inputCls}
                            required
                        />
                    </Field>

                    <Field label="Alamat" error={errors.address}>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            className={inputCls + " resize-none"}
                            rows={3}
                            required
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Latitude" error={errors.latitude}>
                            <input
                                type="number"
                                step="any"
                                value={data.latitude}
                                onChange={(e) =>
                                    setData("latitude", e.target.value)
                                }
                                className={inputCls}
                                placeholder="-6.200000"
                            />
                        </Field>
                        <Field label="Longitude" error={errors.longitude}>
                            <input
                                type="number"
                                step="any"
                                value={data.longitude}
                                onChange={(e) =>
                                    setData("longitude", e.target.value)
                                }
                                className={inputCls}
                                placeholder="106.816666"
                            />
                        </Field>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setEditMode(false);
                            }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

// Main Page 
export default function Profile() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const store = user?.store ?? null;

    const [activeTab, setActiveTab] = useState("profile");
    const { post: postLogout, processing: loggingOut } = useForm({});

    return (
        <div className="p-6 max-w-lg mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <LanguageSelector />
            </div>

            {!user && (
                <p className="text-gray-500">
                    Belum login.{" "}
                    <a href="/login" className="text-blue-500 underline">
                        Login
                    </a>
                </p>
            )}

            {user && (
                <>
                    <div className="flex justify-end">
                        <button
                            onClick={() => postLogout("/logout")}
                            disabled={loggingOut}
                            className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded disabled:opacity-50 cursor-pointer"
                        >
                            {loggingOut ? "..." : "Logout"}
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b">
                        {[
                            { key: "profile", label: "Profil" },
                            { key: "store", label: "Toko" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 text-sm font-semibold cursor-pointer border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="border rounded-xl p-4">
                        {activeTab === "profile" && <ProfileTab user={user} />}
                        {activeTab === "store" && <StoreTab store={store} />}
                    </div>
                </>
            )}
        </div>
    );
}
