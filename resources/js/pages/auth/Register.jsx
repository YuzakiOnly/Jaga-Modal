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
import { AuthHeader, GoogleAccount } from "@/components/auth/LoginPage";
import { useState, useEffect } from "react";
import { Eye, EyeOff, AtSign } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { countryCodes, getCountryByValue } from "@/lib/countryCodes";
import { useTranslation } from "@/hooks/useTranslation";
import { validateRegister } from "@/lib/validation";
import { useValidation } from "@/hooks/useAuthValidation";


const REGISTER_FIELDS = ["name", "username", "email", "phone", "password"];

function generateUsername(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);
}

function RegisterContent({ titlePage, showDescription = false }) {
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
    });

    const valueError = useValidation(validateRegister, lang, serverErrors, locale);
    const selectedCountry = getCountryByValue(data.country_code);

    const update = (field, value) => {
        const updated = { ...data, [field]: value };
        setData(field, value);
        valueError.onChange(field, updated);
        return updated;
    };

    useEffect(() => {
        if (!usernameEdited && data.name) {
            update("username", generateUsername(data.name));
        }
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

            <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
                <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                            {lang("name")}
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            className={valueError.inputClass("name", "mt-1")}
                            placeholder={lang("enter_full_name")}
                            value={data.name}
                            onChange={(e) => update("name", e.target.value)}
                            onBlur={() => valueError.onBlur("name", data)}
                        />
                        {valueError.showError("name") && (
                            <p className="mt-1 text-xs text-destructive">
                                {valueError.errors.name}
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <Label
                            htmlFor="username"
                            className="text-sm font-medium"
                        >
                            {lang("username")}
                        </Label>
                        <div className="relative mt-1">
                            <AtSign
                                className={`absolute left-3 top-2.5 h-5 w-5 ${valueError.iconClass("username")}`}
                            />
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                className={valueError.inputClass(
                                    "username",
                                    "pl-10 pr-16",
                                )}
                                placeholder={lang("username_placeholder")}
                                value={data.username}
                                onChange={handleUsernameChange}
                                onBlur={() => valueError.onBlur("username", data)}
                            />
                            {!usernameEdited && data.name && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wide text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full pointer-events-none">
                                    auto
                                </span>
                            )}
                        </div>
                        {valueError.showError("username") ? (
                            <p className="mt-1 text-xs text-destructive">
                                {valueError.errors.username}
                            </p>
                        ) : (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {lang("username_hint")}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="text-sm font-medium">
                            {lang("email_address")}
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className={valueError.inputClass("email", "mt-1")}
                            placeholder={lang("enter_email")}
                            value={data.email}
                            onChange={(e) => update("email", e.target.value)}
                            onBlur={() => valueError.onBlur("email", data)}
                        />
                        {valueError.showError("email") && (
                            <p className="mt-1 text-xs text-destructive">
                                {valueError.errors.email}
                            </p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <Label htmlFor="phone" className="text-sm font-medium">
                            {lang("phone_number")}
                        </Label>
                        <div className="flex mt-1 gap-2">
                            <div className="w-32">
                                <Select
                                    value={data.country_code}
                                    onValueChange={(val) =>
                                        update("country_code", val)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Code">
                                            <div className="flex items-center gap-2">
                                                <ReactCountryFlag
                                                    countryCode={
                                                        selectedCountry.countryCode
                                                    }
                                                    svg
                                                    style={{
                                                        width: "20px",
                                                        height: "20px",
                                                    }}
                                                />
                                                <span>
                                                    {selectedCountry.value}
                                                </span>
                                            </div>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent
                                        className="max-h-60 overflow-y-auto"
                                        position="popper"
                                        sideOffset={5}
                                    >
                                        {countryCodes.map((country) => (
                                            <SelectItem
                                                key={country.value}
                                                value={country.value}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <ReactCountryFlag
                                                        countryCode={
                                                            country.countryCode
                                                        }
                                                        svg
                                                        style={{
                                                            width: "20px",
                                                            height: "20px",
                                                        }}
                                                    />
                                                    <span>{country.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                className={valueError.inputClass("phone", "flex-1")}
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
                        {valueError.showError("phone") ? (
                            <p className="mt-1 text-xs text-destructive">
                                {valueError.errors.phone}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                                {lang("phone_example")}: {data.country_code}{" "}
                                81234567890
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            {lang("password")}
                        </Label>
                        <div className="relative mt-1">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                className={valueError.inputClass("password", "pr-10")}
                                placeholder={lang("create_password")}
                                value={data.password}
                                onChange={(e) =>
                                    update("password", e.target.value)
                                }
                                onBlur={() => valueError.onBlur("password", data)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 transform focus:outline-none cursor-pointer"
                            >
                                {showPassword ? (
                                    <Eye className="h-5 w-5 text-red-500" />
                                ) : (
                                    <EyeOff className="h-5 w-5 text-green-500" />
                                )}
                            </button>
                        </div>
                        {valueError.showError("password") && (
                            <p className="mt-1 text-xs text-destructive">
                                {valueError.errors.password}
                            </p>
                        )}
                    </div>
                </div>

                <Button type="submit" className="w-full cursor-pointer" disabled={processing}>
                    {processing
                        ? lang("creating_account")
                        : lang("sign_up")}
                </Button>
            </form>

            <div className="mt-4 text-center text-sm">
                {lang("already_have_account")}{" "}
                <Link
                    href="/login"
                    className="underline text-blue-500 hover:text-blue-600"
                >
                    {lang("sign_in")}
                </Link>
            </div>
        </>
    );
}

RegisterContent.layout = (page) => (
    <AuthLayout type="register">{page}</AuthLayout>
);

export default RegisterContent;
