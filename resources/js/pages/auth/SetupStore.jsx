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
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    Crosshair,
    Phone,
    Upload,
    X,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { BUSINESS_TYPES } from "@/lib/setup-store/business-types";
import { COUNTRIES } from "@/lib/setup-store/countries";
import { PROVINCES_ID } from "@/lib/setup-store/provinces";
import { CITIES_ID } from "@/lib/setup-store/cities";
import { StepIndicator } from "@/components/auth/step-indicator";
import {
    loadLeaflet,
    initMap,
    createDraggableMarker,
} from "@/lib/setup-store/map-utils";

const inputBase =
    "border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] placeholder:text-[#c2a89c] focus-visible:border-[#fe5e00] focus-visible:ring-[#fe5e00]/20";

function StepIcon({ icon: Icon }) {
    return (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff3e8] border border-[#fe5e00]/20">
            <Icon className="h-6 w-6 text-[#fe5e00]" />
        </div>
    );
}

function StepBusinessType({
    value,
    onChange,
    onNext,
    customBusinessType,
    setCustomBusinessType,
}) {
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleBusinessTypeChange = (val) => {
        if (val === "other") {
            setShowCustomInput(true);
            onChange("Lainnya");
        } else {
            setShowCustomInput(false);
            const selected = BUSINESS_TYPES.find((t) => t.value === val);
            onChange(selected ? selected.label : val);
            setCustomBusinessType("");
        }
    };

    const handleCustomChange = (e) => {
        const val = e.target.value;
        setCustomBusinessType(val);
        onChange(val);
    };

    const isValueSelected = value && value.trim() !== "";
    const isCustomValid =
        !showCustomInput ||
        (customBusinessType && customBusinessType.trim() !== "");
    const isValid = isValueSelected && isCustomValid;

    return (
        <div className="space-y-6">
            <div className="text-center">
                <StepIcon icon={Building2} />
                <h2 className="text-xl font-semibold text-[#1a1110] font-inter">
                    Jenis Usaha
                </h2>
                <p className="mt-1 text-sm text-[#8a6a62] font-inter">
                    Pilih kategori yang paling sesuai
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {BUSINESS_TYPES.map((type) => {
                    const isActive = value === type.label;

                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => handleBusinessTypeChange(type.value)}
                            className={`rounded-xl border p-4 text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fe5e00] font-inter ${
                                isActive
                                    ? "border-[#fe5e00] bg-[#fff3e8] text-[#fe5e00] shadow-sm"
                                    : "border-[#e8d9ce] text-[#5c4a44] hover:border-[#fe5e00]/40 hover:bg-[#fff8f0]"
                            }`}
                        >
                            <div className="text-2xl">{type.icon}</div>
                            <div className="mt-1 text-sm font-medium">
                                {type.label}
                            </div>
                        </button>
                    );
                })}
            </div>

            {showCustomInput && (
                <div className="space-y-1.5">
                    <Label
                        htmlFor="custom-business"
                        className="text-sm font-medium text-[#1a1110] font-inter"
                    >
                        Tulis jenis usaha Anda
                    </Label>
                    <Input
                        id="custom-business"
                        placeholder="Contoh: Kerajinan Tangan, Laundry, Salon, dll"
                        value={customBusinessType}
                        onChange={handleCustomChange}
                        className={inputBase}
                        autoFocus
                    />
                    <p className="text-xs text-[#c2a89c] font-inter">
                        Silakan tulis jenis usaha Anda secara spesifik
                    </p>
                </div>
            )}

            <Button
                type="button"
                className="w-full bg-[#fe5e00] hover:bg-[#e55400] text-white border-0 shadow-md shadow-[#fe5e00]/25 transition-colors font-inter"
                size="lg"
                disabled={!isValid}
                onClick={onNext}
            >
                Lanjut <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
        </div>
    );
}

function StepStoreInfo({ data, setData, errors, onNext, onBack }) {
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("logo", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setData("logo", null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <StepIcon icon={Store} />
                <h2 className="text-xl font-semibold text-[#1a1110] font-inter">
                    Info Toko
                </h2>
                <p className="mt-1 text-sm text-[#8a6a62] font-inter">
                    Isi nama dan kontak toko Anda
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#1a1110] font-inter">
                        Logo Toko
                    </Label>
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all overflow-hidden ${
                                logoPreview
                                    ? "border-[#fe5e00] bg-[#fff3e8]"
                                    : "border-[#e8d9ce] hover:border-[#fe5e00]/40 hover:bg-[#fff8f0]"
                            }`}
                        >
                            {logoPreview ? (
                                <>
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="h-full w-full rounded-xl object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveLogo();
                                        }}
                                        className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <Upload className="mx-auto h-6 w-6 text-[#c2a89c]" />
                                    <span className="text-[10px] text-[#c2a89c] font-inter">
                                        Upload
                                    </span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-[#c2a89c] font-inter">
                                Upload logo toko Anda (opsional)
                            </p>
                            <p className="text-xs text-[#c2a89c] font-inter">
                                Format: JPG, PNG, SVG. Maks 2MB
                            </p>
                        </div>
                    </div>
                    {errors.logo && (
                        <p className="text-xs text-red-600 font-inter">
                            {errors.logo}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="store-name"
                        className="text-sm font-medium text-[#1a1110] font-inter"
                    >
                        Nama Toko / Usaha{" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="store-name"
                        placeholder="Contoh: Toko Makmur Jaya"
                        value={data.name || ""}
                        onChange={(e) => setData("name", e.target.value)}
                        className={inputBase}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-600 font-inter">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="store-phone"
                        className="text-sm font-medium text-[#1a1110] font-inter"
                    >
                        Nomor Telepon <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#c2a89c]">
                            <Phone className="h-4 w-4" />
                        </span>
                        <Input
                            id="store-phone"
                            type="tel"
                            placeholder="08123456789"
                            value={data.phone || ""}
                            onChange={(e) =>
                                setData(
                                    "phone",
                                    e.target.value.replace(/\D/g, ""),
                                )
                            }
                            className={`pl-9 ${inputBase}`}
                        />
                    </div>
                    <p className="text-xs text-[#c2a89c] font-inter">
                        Nomor yang bisa dihubungi untuk pelanggan
                    </p>
                    {errors.phone && (
                        <p className="text-xs text-red-600 font-inter">
                            {errors.phone}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#e8d9ce] text-[#1a1110] hover:bg-[#fff3e8] hover:text-[#1a1110] font-inter"
                    onClick={onBack}
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Kembali
                </Button>
                <Button
                    type="button"
                    className="flex-1 bg-[#fe5e00] hover:bg-[#e55400] text-white border-0 shadow-md shadow-[#fe5e00]/25 transition-colors font-inter"
                    disabled={!data.name || !data.phone}
                    onClick={onNext}
                >
                    Lanjut <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function StepLocation({ data, setData, errors, processing, onBack }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [locating, setLocating] = useState(false);
    const [searchAddress, setSearchAddress] = useState("");

    const provinces = data.country === "ID" ? PROVINCES_ID : [];
    const cities =
        data.province && CITIES_ID[data.province]
            ? CITIES_ID[data.province]
            : [];

    useEffect(() => {
        loadLeaflet().then(() => setMapLoaded(true));
    }, []);

    useEffect(() => {
        if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

        const defaultLat = data.latitude ? parseFloat(data.latitude) : -6.2088;
        const defaultLng = data.longitude
            ? parseFloat(data.longitude)
            : 106.8456;

        const map = initMap(mapContainerRef, defaultLat, defaultLng);
        if (!map) return;
        mapRef.current = map;

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

        setTimeout(() => {
            map.invalidateSize();
        }, 500);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [mapLoaded]);

    const handleLocate = () => {
        if (!navigator.geolocation) {
            alert("Browser Anda tidak mendukung geolokasi.");
            return;
        }

        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                const map = mapRef.current;
                const marker = markerRef.current;

                if (map && marker) {
                    map.setView([lat, lng], 16);
                    marker.setLatLng([lat, lng]);
                    setData("latitude", lat.toFixed(7));
                    setData("longitude", lng.toFixed(7));
                }
                setLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert(
                    "Gagal mendapatkan lokasi. Pastikan GPS aktif dan izinkan akses lokasi.",
                );
                setLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    };

    const handleSearch = async () => {
        if (!searchAddress.trim()) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`,
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const map = mapRef.current;
                const marker = markerRef.current;

                if (map && marker) {
                    const latNum = parseFloat(lat);
                    const lngNum = parseFloat(lon);
                    map.setView([latNum, lngNum], 16);
                    marker.setLatLng([latNum, lngNum]);
                    setData("latitude", latNum.toFixed(7));
                    setData("longitude", lngNum.toFixed(7));
                }
            } else {
                alert(
                    "Alamat tidak ditemukan. Silakan coba dengan kata kunci lain.",
                );
            }
        } catch (error) {
            console.error("Search error:", error);
            alert("Gagal mencari alamat. Silakan coba lagi.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <StepIcon icon={MapPin} />
                <h2 className="text-xl font-semibold text-[#1a1110] font-inter">
                    Lokasi Toko
                </h2>
                <p className="mt-1 text-sm text-[#8a6a62] font-inter">
                    Tentukan lokasi toko Anda
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#1a1110] font-inter">
                        Negara <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={data.country || "ID"}
                        onValueChange={(val) => {
                            setData("country", val);
                            setData("province", "");
                            setData("city", "");
                        }}
                    >
                        <SelectTrigger className="w-full border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] hover:bg-[#fff3e8] focus:ring-[#fe5e00]/20">
                            <SelectValue placeholder="Pilih negara" />
                        </SelectTrigger>
                        <SelectContent className="z-[1100] border-[#e8d9ce] bg-white text-[#1a1110]">
                            {COUNTRIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.country && (
                        <p className="text-xs text-red-600 font-inter">
                            {errors.country}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#1a1110] font-inter">
                        Provinsi / Wilayah{" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    {provinces.length > 0 ? (
                        <Select
                            value={data.province || ""}
                            onValueChange={(val) => {
                                setData("province", val);
                                setData("city", "");
                            }}
                        >
                            <SelectTrigger
                                className={`w-full border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] hover:bg-[#fff3e8] focus:ring-[#fe5e00]/20 ${!data.province ? "text-[#c2a89c]" : ""}`}
                            >
                                <SelectValue placeholder="Pilih provinsi" />
                            </SelectTrigger>
                            <SelectContent className="z-[1100] max-h-60 overflow-y-auto border-[#e8d9ce] bg-white text-[#1a1110]">
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
                            className={inputBase}
                        />
                    )}
                    {errors.province && (
                        <p className="text-xs text-red-600 font-inter">
                            {errors.province}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-[#1a1110] font-inter">
                        Kota / Kabupaten <span className="text-red-500">*</span>
                    </Label>
                    {cities.length > 0 ? (
                        <Select
                            value={data.city || ""}
                            onValueChange={(val) => setData("city", val)}
                        >
                            <SelectTrigger
                                className={`w-full border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] hover:bg-[#fff3e8] focus:ring-[#fe5e00]/20 ${!data.city ? "text-[#c2a89c]" : ""}`}
                            >
                                <SelectValue placeholder="Pilih kota / kabupaten" />
                            </SelectTrigger>
                            <SelectContent className="z-[1100] max-h-60 overflow-y-auto border-[#e8d9ce] bg-white text-[#1a1110]">
                                {cities.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="rounded-xl border border-[#e8d9ce] bg-[#faf5f0] p-3 text-sm text-[#8a6a62] font-inter">
                            Silakan pilih provinsi terlebih dahulu
                        </div>
                    )}
                    {errors.city && (
                        <p className="text-xs text-red-600 font-inter">
                            {errors.city}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label
                        htmlFor="address"
                        className="text-sm font-medium text-[#1a1110] font-inter"
                    >
                        Alamat Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="address"
                        className={`resize-none ${inputBase}`}
                        rows={2}
                        placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan"
                        value={data.address || ""}
                        onChange={(e) => setData("address", e.target.value)}
                    />
                    {errors.address && (
                        <p className="text-xs text-red-600 font-inter">
                            {errors.address}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-[#1a1110] font-inter">
                            Pin Lokasi <span className="text-red-500">*</span>
                        </Label>
                    </div>

                    <button
                        type="button"
                        onClick={handleLocate}
                        disabled={locating}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#fe5e00]/30 bg-[#fff3e8] px-3 py-2.5 text-sm font-medium text-[#fe5e00] active:bg-[#fe5e00]/10 disabled:opacity-50 font-inter sm:w-auto"
                    >
                        {locating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Mendeteksi...
                            </>
                        ) : (
                            <>
                                <Crosshair className="h-4 w-4" />
                                Lokasi Saya
                            </>
                        )}
                    </button>

                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Cari alamat..."
                            value={searchAddress}
                            onChange={(e) => setSearchAddress(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                            className={inputBase}
                        />
                        <Button
                            type="button"
                            onClick={handleSearch}
                            className="bg-[#fe5e00] hover:bg-[#e55400] text-white shrink-0 font-inter"
                            size="sm"
                        >
                            Cari
                        </Button>
                    </div>

                    <div
                        ref={mapContainerRef}
                        className="relative z-0 h-56 w-full overflow-hidden rounded-xl border border-[#e8d9ce] bg-[#fff8f0]"
                        style={{ minHeight: "224px" }}
                    />

                    <p className="text-xs text-[#c2a89c] font-inter">
                        Klik peta atau seret pin untuk menentukan lokasi
                    </p>

                    {data.latitude && data.longitude && (
                        <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 font-inter">
                            <CheckCircle2 className="h-3 w-3" />
                            {parseFloat(data.latitude).toFixed(5)},{" "}
                            {parseFloat(data.longitude).toFixed(5)}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#e8d9ce] text-[#1a1110] hover:bg-[#fff3e8] hover:text-[#1a1110] font-inter"
                    onClick={onBack}
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Kembali
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-[#fe5e00] hover:bg-[#e55400] text-white border-0 shadow-md shadow-[#fe5e00]/25 transition-colors font-inter"
                    disabled={
                        processing ||
                        !data.country ||
                        !data.province ||
                        !data.city ||
                        !data.address ||
                        !data.latitude ||
                        !data.longitude
                    }
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            Selesai <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-[#c2a89c] font-inter">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Data toko Anda aman dan terlindungi</span>
            </div>
        </div>
    );
}

function SetupStore({ titlePage }) {
    const [step, setStep] = useState(1);
    const [customBusinessType, setCustomBusinessType] = useState("");

    const { data, setData, post, processing, errors } = useForm({
        business_type: "",
        name: "",
        phone: "",
        logo: null,
        country: "ID",
        province: "",
        city: "",
        address: "",
        latitude: "",
        longitude: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (customBusinessType) {
            setData("business_type", customBusinessType);
        }
        post("/setup-store");
    };

    return (
        <>
            <Head title={titlePage ?? "Setup Toko"} />
            <StepIndicator currentStep={step} />

            <form
                onSubmit={handleSubmit}
                className="mt-6 max-w-2xl mx-auto"
                encType="multipart/form-data"
            >
                {step === 1 && (
                    <StepBusinessType
                        value={data.business_type}
                        onChange={(val) => setData("business_type", val)}
                        onNext={() => setStep(2)}
                        customBusinessType={customBusinessType}
                        setCustomBusinessType={setCustomBusinessType}
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
