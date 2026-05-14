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
import { Separator } from "@/Components/ui/separator";
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
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { countryCodes, getCountryByValue } from "@/lib/auth/countryCodes";
import { useTranslation } from "@/hooks/useTranslation";
import { validateRegister } from "@/lib/validation";
import { useValidation } from "@/hooks/useAuthValidation";

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
                className="text-sm font-medium text-foreground"
            >
                {label}
            </Label>
            {children}
            {error ? (
                <p className="text-xs text-destructive">{error}</p>
            ) : hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    );
}

function InputIcon({ children, side = "left" }) {
    return (
        <span
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ${side === "left" ? "left-3" : "right-3"}`}
        >
            {children}
        </span>
    );
}

function RegisterContent({
    titlePage,
    showDescription = false,
    waLink = null,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [usernameEdited, setUsernameEdited] = useState(false);
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

    return (
        <>
            <Head title={titlePage} />
            <AuthHeader
                title={lang("create_account")}
                description={lang("fill_details")}
                showDescription={showDescription}
            />

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                {/* Row: Name & Email - 2 columns side by side */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Name */}
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
                                className={valueError.inputClass(
                                    "name",
                                    "pl-9",
                                )}
                                placeholder={lang("enter_full_name")}
                                value={data.name}
                                onChange={(e) => update("name", e.target.value)}
                                onBlur={() => valueError.onBlur("name", data)}
                            />
                        </div>
                    </Field>

                    {/* Email */}
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
                                className={valueError.inputClass(
                                    "email",
                                    "pl-9",
                                )}
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

                {/* Username - full width */}
                <Field
                    label={lang("username")}
                    htmlFor="username"
                    error={
                        valueError.showError("username")
                            ? valueError.errors.username
                            : null
                    }
                    hint={
                        !valueError.showError("username")
                            ? lang("username_hint")
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
                            className={valueError.inputClass(
                                "username",
                                "pl-9 pr-14",
                            )}
                            placeholder={lang("username_placeholder")}
                            value={data.username}
                            onChange={handleUsernameChange}
                            onBlur={() => valueError.onBlur("username", data)}
                        />
                        {!usernameEdited && data.name && (
                            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                auto
                            </span>
                        )}
                    </div>
                </Field>

                {/* Phone - full width */}
                <Field
                    label={lang("phone_number")}
                    htmlFor="phone"
                    error={
                        valueError.showError("phone")
                            ? valueError.errors.phone
                            : null
                    }
                    hint={
                        !valueError.showError("phone")
                            ? `${lang("phone_example")}: ${data.country_code} 81234567890`
                            : null
                    }
                >
                    <div className="flex gap-2">
                        <Select
                            value={data.country_code}
                            onValueChange={(val) => update("country_code", val)}
                        >
                            <SelectTrigger className="w-[5.5rem] shrink-0 px-2 gap-1">
                                <SelectValue>
                                    <div className="flex items-center gap-1.5">
                                        <ReactCountryFlag
                                            countryCode={
                                                selectedCountry.countryCode
                                            }
                                            svg
                                            style={{ width: 18, height: 18 }}
                                        />
                                        <span className="text-sm">
                                            {selectedCountry.value}
                                        </span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent
                                className="max-h-60"
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
                                className={valueError.inputClass(
                                    "phone",
                                    "pl-9",
                                )}
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

                    {/* Password */}
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
                                className={valueError.inputClass(
                                    "password",
                                    "pl-9 pr-10",
                                )}
                                placeholder={lang("create_password")}
                                value={data.password}
                                onChange={(e) =>
                                    update("password", e.target.value)
                                }
                                onBlur={() =>
                                    valueError.onBlur("password", data)
                                }
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                            >
                                {showPassword ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <EyeOff className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </Field>

                    {/* Invite Code */}
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
                                className={valueError.inputClass(
                                    "invite_code",
                                    "pl-9 font-mono tracking-[0.2em] uppercase",
                                )}
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
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Belum punya kode? Minta via WhatsApp
                            </a>
                        )}
                    </Field>

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={processing}
                >
                    {processing ? lang("creating_account") : lang("sign_up")}
                </Button>
            </form>

            <p className="mt-2 text-center text-sm text-muted-foreground">
                {lang("already_have_account")}{" "}
                <Link
                    href="/login"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                >
                    {lang("sign_in")}
                </Link>
            </p>
        </>
    );
}

RegisterContent.layout = (page) => (
    <AuthLayout type="register">{page}</AuthLayout>
);
export default RegisterContent;
