import { Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Sparkles,
    Loader2,
} from "lucide-react";
import AuthLayout from "@/Layouts/AuthLayout";
import { Head } from "@inertiajs/react";
import { AuthHeader } from "@/components/auth/LoginPage";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { validateLogin } from "@/lib/validation";
import { useValidation } from "@/hooks/useAuthValidation";

function Field({ label, htmlFor, error, children }) {
    return (
        <div className="space-y-1.5">
            <Label
                htmlFor={htmlFor}
                className="text-sm font-medium text-[#1a1110]"
            >
                {label}
            </Label>
            {children}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}

function LoginContent({ titlePage, showDescription = true }) {
    const [showPassword, setShowPassword] = useState(false);
    const { lang, locale } = useTranslation();

    const {
        data,
        setData,
        post,
        processing,
        errors: serverErrors,
    } = useForm({
        login: "",
        password: "",
        remember: false,
    });

    const combinedServerErrors =
        Object.keys(serverErrors).length > 0
            ? {
                  login: lang("validation_email_password_invalid"),
                  password: " ",
              }
            : {};

    const valueError = useValidation(
        validateLogin,
        lang,
        combinedServerErrors,
        locale,
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!valueError.onSubmit(["login", "password"], data)) return;
        post("/login");
    };

    return (
        <>
            <Head title={titlePage} />

            <AuthHeader
                title={lang("welcome_back")}
                description={lang("sign_in_account")}
                showDescription={showDescription}
            />

            <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-4 font-inter"
                noValidate
            >
                <Field
                    label={lang("email_address")}
                    htmlFor="login"
                    error={
                        valueError.showError("login")
                            ? valueError.errors.login
                            : null
                    }
                >
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#c2a89c]">
                            <User className="h-4 w-4" />
                        </span>
                        <Input
                            id="login"
                            name="login"
                            type="text"
                            autoComplete="username"
                            className={`pl-9 border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] placeholder:text-[#c2a89c] focus-visible:border-[#fe5e00] focus-visible:ring-[#fe5e00]/20 ${valueError.inputClass(
                                "login",
                                "",
                            )}`}
                            placeholder={
                                lang("email_address") || "Email atau Username"
                            }
                            value={data.login}
                            onChange={(e) => {
                                setData("login", e.target.value);
                                valueError.onChange("login", {
                                    ...data,
                                    login: e.target.value,
                                });
                            }}
                            onBlur={() => valueError.onBlur("login", data)}
                        />
                    </div>
                </Field>

                <Field
                    label={lang("password")}
                    htmlFor="password"
                    error={
                        valueError.showError("password") &&
                        valueError.errors.password?.trim()
                            ? valueError.errors.password
                            : null
                    }
                >
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#c2a89c]">
                            <Lock className="h-4 w-4" />
                        </span>
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className={`pl-9 pr-10 border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] placeholder:text-[#c2a89c] focus-visible:border-[#fe5e00] focus-visible:ring-[#fe5e00]/20 ${valueError.inputClass(
                                "password",
                                "",
                            )}`}
                            placeholder={lang("password")}
                            value={data.password}
                            onChange={(e) => {
                                setData("password", e.target.value);
                                valueError.onChange("password", {
                                    ...data,
                                    password: e.target.value,
                                });
                            }}
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

                <div className="flex justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-[#a8665a] underline-offset-4 hover:text-[#fe5e00] hover:underline transition-colors"
                    >
                        {lang("forgot_password")}
                    </Link>
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#fe5e00] hover:bg-[#e55400] text-white border-0 shadow-md shadow-[#fe5e00]/25 transition-colors"
                    size="lg"
                    disabled={processing}
                >
                    {processing ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {lang("signing_in")}
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            {lang("sign_in")}
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="mt-6 space-y-4">
                <p className="text-center text-sm text-[#8a6a62]">
                    {lang("dont_have_account")}{" "}
                    <Link
                        href="/register"
                        className="font-semibold text-[#fe5e00] underline-offset-4 hover:underline"
                    >
                        {lang("sign_up")}
                    </Link>
                </p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#c2a89c]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Keamanan data terjamin</span>
            </div>
        </>
    );
}

LoginContent.layout = (page) => <AuthLayout type="login">{page}</AuthLayout>;
export default LoginContent;
