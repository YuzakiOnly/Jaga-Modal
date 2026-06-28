import { Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import AuthLayout from "@/Layouts/AuthLayout";
import { Head } from "@inertiajs/react";
import { AuthHeader } from "@/components/auth/LoginPage";
import { useState, useEffect } from "react";
import {
    Eye,
    EyeOff,
    AtSign,
    KeyRound,
    MessageCircle,
    User,
    Mail,
    Phone,
    Lock,
    ArrowRight,
    ShieldCheck,
    Loader2,
    Sparkles,
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { countryCodes, getCountryByValue } from "@/lib/auth/countryCodes";
import { useTranslation } from "@/hooks/useTranslation";
import { validateRegister } from "@/lib/validation";
import { useValidation } from "@/hooks/useAuthValidation";
import axios from "axios";

const REGISTER_FIELDS = [
    "name",
    "username",
    "email",
    "phone",
    "password",
    "invite_code",
];

function generateUsername(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);
}

function Field({ label, htmlFor, hint, error, children, className = "" }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <Label
                htmlFor={htmlFor}
                className="text-sm font-medium text-[#1a1110]"
            >
                {label}
            </Label>
            {children}
            {error ? (
                <p className="text-xs text-red-600">{error}</p>
            ) : hint ? (
                <p className="text-xs text-[#c2a89c]">{hint}</p>
            ) : null}
        </div>
    );
}

function InputIcon({ children, side = "left" }) {
    return (
        <span
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#c2a89c] ${side === "left" ? "left-3" : "right-3"}`}
        >
            {children}
        </span>
    );
}

const inputBase =
    "border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] placeholder:text-[#c2a89c] focus-visible:border-[#fe5e00] focus-visible:ring-[#fe5e00]/20";

function RegisterContent({
    titlePage,
    showDescription = false,
    waLink = null,
    waNumber = null,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [usernameEdited, setUsernameEdited] = useState(false);
    const [loadingCode, setLoadingCode] = useState(false);
    const { lang, locale } = useTranslation();

    const {
        data,
        setData,
        post,
        processing,
        errors: serverErrors,
    } = useForm({
        name: "",
        username: "",
        email: "",
        phone: "",
        country_code: "+62",
        password: "",
        invite_code: "",
    });

    const valueError = useValidation(
        validateRegister,
        lang,
        serverErrors,
        locale,
    );
    const selectedCountry = getCountryByValue(data.country_code);

    const update = (field, value) => {
        const updated = { ...data, [field]: value };
        setData(field, value);
        valueError.onChange(field, updated);
        return updated;
    };

    useEffect(() => {
        if (!usernameEdited && data.name)
            update("username", generateUsername(data.name));
    }, [data.name]);

    const handleUsernameChange = (e) => {
        setUsernameEdited(true);
        update(
            "username",
            e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valueError.onSubmit(REGISTER_FIELDS, data)) return;
        post("/register");
    };

    const handleGetWhatsAppLink = async () => {
        setLoadingCode(true);
        try {
            const response = await axios.get("/api/whatsapp-link");

            if (response.data.success && response.data.wa_link) {
                window.open(response.data.wa_link, "_blank");

                if (response.data.invite_code) {
                    update("invite_code", response.data.invite_code);
                }
            } else {
                if (waLink) {
                    window.open(waLink, "_blank");
                }
            }
        } catch (error) {
            console.error("Error getting WhatsApp link:", error);
            if (waLink) {
                window.open(waLink, "_blank");
            }
        } finally {
            setLoadingCode(false);
        }
    };

    return (
        <>
            <Head title={titlePage} />
            <AuthHeader
                title={lang("create_account")}
                description={lang("fill_details")}
                showDescription={showDescription}
            />

            <form onSubmit={handleSubmit} className="mt-6 space-y-2 font-inter" noValidate>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                        label={lang("name")}
                        htmlFor="name"
                        error={
                            valueError.showError("name")
                                ? valueError.errors.name
                                : null
                        }
                    >
                        <div className="relative">
                            <InputIcon>
                                <User className="h-4 w-4" />
                            </InputIcon>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                className={`pl-9 ${inputBase} ${valueError.inputClass("name", "")}`}
                                placeholder={lang("enter_full_name")}
                                value={data.name}
                                onChange={(e) => update("name", e.target.value)}
                                onBlur={() => valueError.onBlur("name", data)}
                            />
                        </div>
                    </Field>

                    <Field
                        label={lang("email_address")}
                        htmlFor="email"
                        error={
                            valueError.showError("email")
                                ? valueError.errors.email
                                : null
                        }
                    >
                        <div className="relative">
                            <InputIcon>
                                <Mail className="h-4 w-4" />
                            </InputIcon>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={`pl-9 ${inputBase} ${valueError.inputClass("email", "")}`}
                                placeholder={lang("enter_email")}
                                value={data.email}
                                onChange={(e) =>
                                    update("email", e.target.value)
                                }
                                onBlur={() => valueError.onBlur("email", data)}
                            />
                        </div>
                    </Field>
                </div>

                <Field
                    label={lang("username")}
                    htmlFor="username"
                    error={
                        valueError.showError("username")
                            ? valueError.errors.username
                            : null
                    }
                >
                    <div className="relative">
                        <InputIcon>
                            <AtSign className="h-4 w-4" />
                        </InputIcon>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            className={`pl-9 pr-14 ${inputBase} ${valueError.inputClass("username", "")}`}
                            placeholder={lang("username_placeholder")}
                            value={data.username}
                            onChange={handleUsernameChange}
                            onBlur={() => valueError.onBlur("username", data)}
                        />
                        {!usernameEdited && data.name && (
                            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-[#fe5e00]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#fe5e00]">
                                auto
                            </span>
                        )}
                    </div>
                </Field>

                <Field
                    label={lang("phone_number")}
                    htmlFor="phone"
                    error={
                        valueError.showError("phone")
                            ? valueError.errors.phone
                            : null
                    }
                >
                    <div className="flex gap-2">
                        <Select
                            value={data.country_code}
                            onValueChange={(val) => update("country_code", val)}
                        >
                            <SelectTrigger className="w-22 shrink-0 px-2 gap-1 border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] hover:bg-[#fff3e8] focus:ring-[#fe5e00]/20">
                                <SelectValue>
                                    <div className="flex items-center gap-1.5">
                                        <ReactCountryFlag
                                            countryCode={
                                                selectedCountry.countryCode
                                            }
                                            svg
                                            style={{ width: 18, height: 18 }}
                                        />
                                        <span className="text-sm text-[#1a1110]">
                                            {selectedCountry.value}
                                        </span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent
                                className="max-h-60 border-[#e8d9ce] bg-white text-[#1a1110]"
                                position="popper"
                                sideOffset={4}
                            >
                                {countryCodes.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        <div className="flex items-center gap-2">
                                            <ReactCountryFlag
                                                countryCode={c.countryCode}
                                                svg
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                }}
                                            />
                                            <span>{c.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1">
                            <InputIcon>
                                <Phone className="h-4 w-4" />
                            </InputIcon>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                className={`pl-9 ${inputBase} ${valueError.inputClass("phone", "")}`}
                                placeholder="81234567890"
                                value={data.phone}
                                onChange={(e) =>
                                    update(
                                        "phone",
                                        e.target.value.replace(/\D/g, ""),
                                    )
                                }
                                onBlur={() => valueError.onBlur("phone", data)}
                            />
                        </div>
                    </div>
                </Field>

                <Field
                    label={lang("password")}
                    htmlFor="password"
                    error={
                        valueError.showError("password")
                            ? valueError.errors.password
                            : null
                    }
                >
                    <div className="relative">
                        <InputIcon>
                            <Lock className="h-4 w-4" />
                        </InputIcon>
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={`pl-9 pr-10 ${inputBase} ${valueError.inputClass("password", "")}`}
                            placeholder={lang("create_password")}
                            value={data.password}
                            onChange={(e) => update("password", e.target.value)}
                            onBlur={() => valueError.onBlur("password", data)}
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c2a89c] hover:text-[#1a1110] transition-colors focus:outline-none cursor-pointer"
                        >
                            {showPassword ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </Field>

                <Field
                    label={lang("invite_code") ?? "Kode Invite"}
                    htmlFor="invite_code"
                    error={
                        valueError.showError("invite_code")
                            ? valueError.errors.invite_code
                            : null
                    }
                >
                    <div className="relative">
                        <InputIcon>
                            <KeyRound className="h-4 w-4" />
                        </InputIcon>
                        <Input
                            id="invite_code"
                            name="invite_code"
                            type="text"
                            className={`pl-9 font-mono tracking-[0.2em] uppercase ${inputBase} ${valueError.inputClass("invite_code", "")}`}
                            placeholder="XXXXXXXX"
                            value={data.invite_code}
                            onChange={(e) =>
                                update(
                                    "invite_code",
                                    e.target.value.toUpperCase(),
                                )
                            }
                            onBlur={() =>
                                valueError.onBlur("invite_code", data)
                            }
                        />
                    </div>
                    {waLink && (
                        <button
                            type="button"
                            onClick={handleGetWhatsAppLink}
                            disabled={loadingCode}
                            className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                                loadingCode
                                    ? "text-[#c2a89c] cursor-not-allowed"
                                    : "text-emerald-600 hover:text-emerald-700"
                            }`}
                        >
                            {loadingCode ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <MessageCircle className="h-3.5 w-3.5" />
                            )}
                            {loadingCode
                                ? "Memproses..."
                                : "Belum punya kode? Minta via WhatsApp"}
                        </button>
                    )}
                </Field>

                <Button
                    type="submit"
                    className="w-full bg-[#fe5e00] hover:bg-[#e55400] text-white border-0 shadow-md shadow-[#fe5e00]/25 transition-colors"
                    size="lg"
                    disabled={processing}
                >
                    {processing ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {lang("creating_account")}
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            {lang("sign_up")}
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    )}
                </Button>
            </form>

            <p className="mt-2 text-center text-sm text-[#8a6a62]">
                {lang("already_have_account")}{" "}
                <Link
                    href="/login"
                    className="font-semibold text-[#fe5e00] underline-offset-4 hover:underline"
                >
                    {lang("sign_in")}
                </Link>
            </p>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#c2a89c]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Data Anda aman dan terlindungi</span>
            </div>
        </>
    );
}

RegisterContent.layout = (page) => (
    <AuthLayout type="register">{page}</AuthLayout>
);
export default RegisterContent;
