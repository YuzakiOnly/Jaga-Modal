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
import { useState, useEffect, useRef } from "react";
import {
    MapPin,
    Store,
    Building2,
    ChevronRight,
    ChevronLeft,
    Loader2,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { BUSINESS_TYPES } from "@/lib/setup-store/business-types";
import { COUNTRIES } from "@/lib/setup-store/countries";
import { PROVINCES_ID } from "@/lib/setup-store/provinces";
import { StepIndicator } from "@/components/auth/step-indicator";
import {
    loadLeaflet,
    initMap,
    createDraggableMarker,
} from "@/lib/setup-store/map-utils";

/* ── Step 1: Jenis Usaha ── */
function StepBusinessType({ value, onChange, onNext }) {
    return (
        <div className="space-y-5">
            <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                    Jenis Usaha
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pilih kategori yang paling sesuai
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map((type) => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => onChange(type.value)}
                        className={`rounded-lg border px-3 py-2.5 text-sm text-left font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            value === type.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-foreground hover:border-primary/40 hover:bg-muted"
                        }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            <Button
                type="button"
                className="w-full"
                size="lg"
                disabled={!value}
                onClick={onNext}
            >
                Lanjut <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
        </div>
    );
}

/* ── Step 2: Info Toko ── */
function StepStoreInfo({ data, setData, errors, onNext, onBack }) {
    const provinces = data.country === "ID" ? PROVINCES_ID : [];

    return (
        <div className="space-y-5">
            <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Store className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                    Informasi Toko
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Isi detail toko Anda
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="store-name" className="text-sm font-medium">
                        Nama Toko / Usaha
                    </Label>
                    <Input
                        id="store-name"
                        placeholder="Contoh: Toko Makmur Jaya"
                        value={data.name || ""}
                        onChange={(e) => setData("name", e.target.value)}
                    />
                    {errors.name && (
                        <p className="text-xs text-destructive">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Negara</Label>
                    <Select
                        value={data.country || "ID"}
                        onValueChange={(val) => setData("country", val)}
                    >
                        <SelectTrigger className="w-full">
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
                        <p className="text-xs text-destructive">
                            {errors.country}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                        Provinsi / Wilayah
                    </Label>
                    {provinces.length > 0 ? (
                        <Select
                            value={data.province || ""}
                            onValueChange={(val) => setData("province", val)}
                        >
                            <SelectTrigger className="w-full">
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
                            placeholder="Masukkan wilayah / provinsi"
                            value={data.province || ""}
                            onChange={(e) =>
                                setData("province", e.target.value)
                            }
                        />
                    )}
                    {errors.province && (
                        <p className="text-xs text-destructive">
                            {errors.province}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Kembali
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

/* ── Step 3: Lokasi ── */
function StepLocation({ data, setData, errors, processing, onBack }) {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        loadLeaflet().then(() => setMapLoaded(true));
    }, []);

    useEffect(() => {
        if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

        const defaultLat = data.latitude ? parseFloat(data.latitude) : -6.2088;
        const defaultLng = data.longitude
            ? parseFloat(data.longitude)
            : 106.8456;

        const map = initMap(mapRef, defaultLat, defaultLng);
        if (!map) return;
        mapInstanceRef.current = map;

        const updatePosition = (latlng) => {
            setData("latitude", latlng.lat.toFixed(7));
            setData("longitude", latlng.lng.toFixed(7));
        };

        const marker = createDraggableMarker(
            map,
            defaultLat,
            defaultLng,
            updatePosition,
        );
        markerRef.current = marker;
        map.on("click", (e) => {
            marker.setLatLng(e.latlng);
            updatePosition(e.latlng);
        });
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
                    setData("latitude", lat.toFixed(7));
                    setData("longitude", lng.toFixed(7));
                }
                setLocating(false);
            },
            () => setLocating(false),
        );
    };

    return (
        <div className="space-y-5">
            <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">
                    Lokasi Toko
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Tandai lokasi toko di peta
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm font-medium">
                        Alamat Lengkap
                    </Label>
                    <Textarea
                        id="address"
                        className="resize-none"
                        rows={2}
                        placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
                        value={data.address || ""}
                        onChange={(e) => setData("address", e.target.value)}
                    />
                    {errors.address && (
                        <p className="text-xs text-destructive">
                            {errors.address}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                            Pin Lokasi
                        </Label>
                        <button
                            type="button"
                            onClick={handleLocate}
                            disabled={locating}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline underline-offset-4 cursor-pointer disabled:opacity-50"
                        >
                            {locating ? (
                                <>
                                    <Loader2 className="h-3 w-3 animate-spin" />{" "}
                                    Mendeteksi...
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-3 w-3" /> Lokasi Saya
                                </>
                            )}
                        </button>
                    </div>
                    <div
                        ref={mapRef}
                        className="h-52 w-full overflow-hidden rounded-lg border bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                        Klik peta atau seret pin untuk menentukan lokasi
                    </p>
                    {data.latitude && data.longitude && (
                        <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <span>✓</span>
                            {parseFloat(data.latitude).toFixed(5)},{" "}
                            {parseFloat(data.longitude).toFixed(5)}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onBack}
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Kembali
                </Button>
                <Button
                    type="submit"
                    className="flex-1"
                    disabled={processing || !data.address}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Menyimpan...
                        </>
                    ) : (
                        "Selesai →"
                    )}
                </Button>
            </div>
        </div>
    );
}

/* ── Main ── */
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

    return (
        <>
            <Head title={titlePage ?? "Setup Toko"} />
            <StepIndicator currentStep={step} />

            <form onSubmit={handleSubmit} className="mt-6">
                {step === 1 && (
                    <StepBusinessType
                        value={data.business_type}
                        onChange={(val) => setData("business_type", val)}
                        onNext={() => setStep(2)}
                    />
                )}
                {step === 2 && (
                    <StepStoreInfo
                        data={data}
                        setData={setData}
                        errors={errors}
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )}
                {step === 3 && (
                    <StepLocation
                        data={data}
                        setData={setData}
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
