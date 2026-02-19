import { useForm } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import AuthLayout from "@/Layouts/AuthLayout";
import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Store, Building2, ChevronRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

// ─── Daftar jenis usaha ───────────────────────────────────────────────────────
const BUSINESS_TYPES = [
    { value: "retail", label: "Retail / Toko Umum" },
    { value: "food", label: "Makanan & Minuman" },
    { value: "fashion", label: "Fashion & Pakaian" },
    { value: "electronics", label: "Elektronik" },
    { value: "beauty", label: "Kecantikan & Perawatan" },
    { value: "pharmacy", label: "Apotek / Kesehatan" },
    { value: "automotive", label: "Otomotif" },
    { value: "furniture", label: "Furnitur & Dekorasi" },
    { value: "grocery", label: "Sembako / Supermarket" },
    { value: "service", label: "Jasa / Servis" },
    { value: "education", label: "Pendidikan" },
    { value: "other", label: "Lainnya" },
];

// ─── Daftar negara (sederhana) ────────────────────────────────────────────────
const COUNTRIES = [
    { value: "ID", label: "Indonesia" },
    { value: "MY", label: "Malaysia" },
    { value: "SG", label: "Singapore" },
    { value: "TH", label: "Thailand" },
    { value: "PH", label: "Philippines" },
    { value: "VN", label: "Vietnam" },
    { value: "JP", label: "Japan" },
    { value: "US", label: "United States" },
    { value: "GB", label: "United Kingdom" },
    { value: "AU", label: "Australia" },
];

// ─── Provinsi Indonesia ───────────────────────────────────────────────────────
const PROVINCES_ID = [
    "Aceh",
    "Bali",
    "Bangka Belitung",
    "Banten",
    "Bengkulu",
    "DI Yogyakarta",
    "DKI Jakarta",
    "Gorontalo",
    "Jambi",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Kalimantan Barat",
    "Kalimantan Selatan",
    "Kalimantan Tengah",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Kepulauan Riau",
    "Lampung",
    "Maluku",
    "Maluku Utara",
    "Nusa Tenggara Barat",
    "Nusa Tenggara Timur",
    "Papua",
    "Papua Barat",
    "Papua Barat Daya",
    "Papua Pegunungan",
    "Papua Selatan",
    "Papua Tengah",
    "Riau",
    "Sulawesi Barat",
    "Sulawesi Selatan",
    "Sulawesi Tengah",
    "Sulawesi Tenggara",
    "Sulawesi Utara",
    "Sumatera Barat",
    "Sumatera Selatan",
    "Sumatera Utara",
];

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
    const steps = ["Jenis Usaha", "Info Toko", "Lokasi"];
    return (
        <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((label, idx) => {
                const step = idx + 1;
                const done = currentStep > step;
                const active = currentStep === step;
                return (
                    <div key={step} className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                    ${done ? "bg-green-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                            >
                                {done ? "✓" : step}
                            </div>
                            <span
                                className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
                            >
                                {label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div
                                className={`w-10 h-0.5 mb-4 ${done ? "bg-green-500" : "bg-muted"}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Step 1: Jenis Usaha ──────────────────────────────────────────────────────
function StepBusinessType({ value, onChange, onNext }) {
    return (
        <div className="space-y-4">
            <div className="text-center mb-2">
                <Building2 className="mx-auto h-10 w-10 text-primary mb-2" />
                <h2 className="text-lg font-semibold">Pilih Jenis Usaha</h2>
                <p className="text-sm text-muted-foreground">
                    Pilih kategori yang paling sesuai dengan usaha Anda
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map((type) => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => onChange(type.value)}
                        className={`p-3 rounded-lg border text-sm text-left transition-all cursor-pointer
                            ${
                                value === type.value
                                    ? "border-primary bg-primary/10 text-primary font-semibold"
                                    : "border-border hover:border-primary/50 hover:bg-muted"
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            <Button
                type="button"
                className="w-full mt-2"
                disabled={!value}
                onClick={onNext}
            >
                Lanjut <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
        </div>
    );
}

// ─── Step 2: Info Toko ────────────────────────────────────────────────────────
function StepStoreInfo({ data, setData, errors, onNext, onBack }) {
    const provinces = data.country === "ID" ? PROVINCES_ID : [];

    return (
        <div className="space-y-4">
            <div className="text-center mb-2">
                <Store className="mx-auto h-10 w-10 text-primary mb-2" />
                <h2 className="text-lg font-semibold">Informasi Toko</h2>
                <p className="text-sm text-muted-foreground">
                    Isi detail toko Anda
                </p>
            </div>

            {/* Nama Toko */}
            <div>
                <Label htmlFor="name" className="text-sm font-medium">
                    Nama Toko / Usaha
                </Label>
                <Input
                    id="name"
                    className="mt-1"
                    placeholder="Contoh: Toko Makmur Jaya"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-destructive">
                        {errors.name}
                    </p>
                )}
            </div>

            {/* Negara */}
            <div>
                <Label className="text-sm font-medium">Negara</Label>
                <Select
                    value={data.country}
                    onValueChange={(val) => setData("country", val)}
                >
                    <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Pilih negara" />
                    </SelectTrigger>
                    <SelectContent>
                        {COUNTRIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                                {c.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.country && (
                    <p className="mt-1 text-xs text-destructive">
                        {errors.country}
                    </p>
                )}
            </div>

            {/* Provinsi */}
            <div>
                <Label className="text-sm font-medium">
                    Provinsi / Wilayah
                </Label>
                {provinces.length > 0 ? (
                    <Select
                        value={data.province}
                        onValueChange={(val) => setData("province", val)}
                    >
                        <SelectTrigger className="mt-1 w-full">
                            <SelectValue placeholder="Pilih provinsi" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            {provinces.map((p) => (
                                <SelectItem key={p} value={p}>
                                    {p}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        className="mt-1"
                        placeholder="Masukkan wilayah / provinsi"
                        value={data.province}
                        onChange={(e) => setData("province", e.target.value)}
                    />
                )}
                {errors.province && (
                    <p className="mt-1 text-xs text-destructive">
                        {errors.province}
                    </p>
                )}
            </div>

            <div className="flex gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                >
                    Kembali
                </Button>
                <Button
                    type="button"
                    className="flex-1"
                    disabled={!data.name || !data.country || !data.province}
                    onClick={onNext}
                >
                    Lanjut <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

// ─── Step 3: Lokasi & Alamat ──────────────────────────────────────────────────
function StepLocation({ data, setData, errors, processing, onBack }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [locating, setLocating] = useState(false);

    // Load Leaflet dynamically
    useEffect(() => {
        if (window.L) {
            setMapLoaded(true);
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
    }, []);

    // Init map
    useEffect(() => {
        if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

        const L = window.L;
        const defaultLat = data.latitude || -6.2088;
        const defaultLng = data.longitude || 106.8456;

        const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        const marker = L.marker([defaultLat, defaultLng], {
            draggable: true,
        }).addTo(map);
        markerRef.current = marker;

        const updatePosition = (latlng) => {
            setData((prev) => ({
                ...prev,
                latitude: latlng.lat.toFixed(7),
                longitude: latlng.lng.toFixed(7),
            }));
        };

        marker.on("dragend", (e) => updatePosition(e.target.getLatLng()));
        map.on("click", (e) => {
            marker.setLatLng(e.latlng);
            updatePosition(e.latlng);
        });

        if (data.latitude && data.longitude) {
            updatePosition({ lat: data.latitude, lng: data.longitude });
        }
    }, [mapLoaded]);

    const handleLocate = () => {
        setLocating(true);
        navigator.geolocation?.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                const L = window.L;
                const map = mapInstanceRef.current;
                const marker = markerRef.current;
                if (map && marker && L) {
                    const latlng = L.latLng(lat, lng);
                    map.setView(latlng, 16);
                    marker.setLatLng(latlng);
                    setData((prev) => ({
                        ...prev,
                        latitude: lat.toFixed(7),
                        longitude: lng.toFixed(7),
                    }));
                }
                setLocating(false);
            },
            () => setLocating(false),
        );
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-2">
                <MapPin className="mx-auto h-10 w-10 text-primary mb-2" />
                <h2 className="text-lg font-semibold">Lokasi Toko</h2>
                <p className="text-sm text-muted-foreground">
                    Tandai lokasi toko Anda di peta
                </p>
            </div>

            {/* Alamat */}
            <div>
                <Label htmlFor="address" className="text-sm font-medium">
                    Alamat Lengkap
                </Label>
                <Textarea
                    id="address"
                    className="mt-1 resize-none"
                    rows={2}
                    placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
                    value={data.address}
                    onChange={(e) => setData("address", e.target.value)}
                />
                {errors.address && (
                    <p className="mt-1 text-xs text-destructive">
                        {errors.address}
                    </p>
                )}
            </div>

            {/* Peta */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <Label className="text-sm font-medium">Pin Lokasi</Label>
                    <button
                        type="button"
                        onClick={handleLocate}
                        className="text-xs text-primary underline hover:no-underline"
                        disabled={locating}
                    >
                        {locating ? "Mendeteksi..." : "📍 Lokasi Saya"}
                    </button>
                </div>
                <div
                    ref={mapRef}
                    className="w-full h-56 rounded-lg border overflow-hidden bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Klik peta atau seret pin untuk menentukan lokasi toko
                </p>
                {data.latitude && data.longitude && (
                    <p className="text-xs text-green-600 mt-0.5">
                        ✓ Koordinat: {parseFloat(data.latitude).toFixed(5)},{" "}
                        {parseFloat(data.longitude).toFixed(5)}
                    </p>
                )}
            </div>

            <div className="flex gap-2 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                >
                    Kembali
                </Button>
                <Button
                    type="submit"
                    className="flex-1"
                    disabled={processing || !data.address}
                >
                    {processing ? "Menyimpan..." : "Selesai & Masuk →"}
                </Button>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function SetupStore({ titlePage }) {
    const [step, setStep] = useState(1);

    const { data, setData, post, processing, errors } = useForm({
        business_type: "",
        name: "",
        country: "ID",
        province: "",
        address: "",
        latitude: "",
        longitude: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/setup-store");
    };

    const setField = (field, value) => setData(field, value);

    // Untuk StepLocation yang perlu setData seluruh object
    const setBulkData = (updater) => {
        if (typeof updater === "function") {
            setData((prev) => updater(prev));
        }
    };

    return (
        <>
            <Head title={titlePage ?? "Setup Toko"} />
            <div className="mb-4">
                <h1 className="text-xl font-bold text-center">
                    Selamat Datang! 🎉
                </h1>
                <p className="text-sm text-muted-foreground text-center">
                    Lengkapi profil toko Anda untuk mulai berjualan
                </p>
            </div>

            <StepIndicator currentStep={step} />

            <form onSubmit={handleSubmit}>
                {step === 1 && (
                    <StepBusinessType
                        value={data.business_type}
                        onChange={(val) => setField("business_type", val)}
                        onNext={() => setStep(2)}
                    />
                )}

                {step === 2 && (
                    <StepStoreInfo
                        data={data}
                        setData={setField}
                        errors={errors}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )}

                {step === 3 && (
                    <StepLocation
                        data={data}
                        setData={setBulkData}
                        errors={errors}
                        processing={processing}
                        onBack={() => setStep(2)}
                    />
                )}
            </form>
        </>
    );
}

SetupStore.layout = (page) => <AuthLayout type="setup">{page}</AuthLayout>;

export default SetupStore;
