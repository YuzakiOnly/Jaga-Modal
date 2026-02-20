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
import { MapPin, Store, Building2, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

import { BUSINESS_TYPES } from "@/lib/setup-store/business-types";
import { COUNTRIES } from "@/lib/setup-store/countries";
import { PROVINCES_ID } from "@/lib/setup-store/provinces";
import { StepIndicator } from "@/components/auth/step-indicator";
import { loadLeaflet, initMap, createDraggableMarker } from "@/lib/setup-store/map-utils";

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

            <div>
                <Label htmlFor="name" className="text-sm font-medium">
                    Nama Toko / Usaha
                </Label>
                <Input
                    id="name"
                    className="mt-1"
                    placeholder="Contoh: Toko Makmur Jaya"
                    value={data.name || ""}
                    onChange={(e) => setData("name", e.target.value)}
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-destructive">
                        {errors.name}
                    </p>
                )}
            </div>

            <div>
                <Label className="text-sm font-medium">Negara</Label>
                <Select
                    value={data.country || "ID"}
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

            <div>
                <Label className="text-sm font-medium">
                    Provinsi / Wilayah
                </Label>
                {provinces.length > 0 ? (
                    <Select
                        value={data.province || ""}
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
                        value={data.province || ""}
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
        <div className="space-y-4">
            <div className="text-center mb-2">
                <MapPin className="mx-auto h-10 w-10 text-primary mb-2" />
                <h2 className="text-lg font-semibold">Lokasi Toko</h2>
                <p className="text-sm text-muted-foreground">
                    Tandai lokasi toko Anda di peta
                </p>
            </div>

            <div>
                <Label htmlFor="address" className="text-sm font-medium">
                    Alamat Lengkap
                </Label>
                <Textarea
                    id="address"
                    className="mt-1 resize-none"
                    rows={2}
                    placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
                    value={data.address || ""}
                    onChange={(e) => setData("address", e.target.value)}
                />
                {errors.address && (
                    <p className="mt-1 text-xs text-destructive">
                        {errors.address}
                    </p>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-1">
                    <Label className="text-sm font-medium">Pin Lokasi</Label>
                    <button
                        type="button"
                        onClick={handleLocate}
                        className="text-xs text-primary underline hover:no-underline inline-flex items-center gap-1 cursor-pointer"
                        disabled={locating}
                    >
                        {locating ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Mendeteksi...
                            </>
                        ) : (
                            <>
                                <MapPin className="h-3 w-3" />
                                Lokasi Saya
                            </>
                        )}
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

            <form onSubmit={handleSubmit}>
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
