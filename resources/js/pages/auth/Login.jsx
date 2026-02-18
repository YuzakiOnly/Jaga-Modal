import { Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/Layouts/AuthLayout";
import { Head } from "@inertiajs/react";
import { AuthHeader, GoogleAccount } from "@/components/auth/LoginPage";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { validateLogin } from "@/lib/validation";
import { useValidation } from "@/hooks/useAuthValidation";

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
        email: "",
        password: "",
        remember: false,
    });

    const combinedServerErrors =
        Object.keys(serverErrors).length > 0
            ? {
                  email: lang("validation_email_password_invalid"),
                  password: " ",
              }
            : {};
    const valueError = useValidation(validateLogin, lang, combinedServerErrors, locale);

    const handleSubmit = (e) => {   
        e.preventDefault();
        if (!valueError.onSubmit(["email", "password"], data)) return;
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

            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
                <div className="space-y-4">
                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="sr-only">
                            {lang("email_address")}
                        </Label>
                        <div className="relative">
                            <Mail
                                className={`absolute left-3 top-2.5 h-5 w-5 ${valueError.iconClass("email")}`}
                            />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={valueError.inputClass("email", "pl-10")}
                                placeholder={lang("email_address")}
                                value={data.email}
                                onChange={(e) => {
                                    setData("email", e.target.value);
                                    valueError.onChange("email", {
                                        ...data,
                                        email: e.target.value,
                                    });
                                }}
                                onBlur={() => valueError.onBlur("email", data)}
                            />
                        </div>
                        {valueError.showError("email") && (
                            <p className="mt-1 text-xs text-destructive">
                                {valueError.errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="password" className="sr-only">
                            {lang("password")}
                        </Label>
                        <div className="relative">
                            <Lock
                                className={`absolute left-3 top-2.5 h-5 w-5 ${valueError.iconClass("password")}`}
                            />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                className={valueError.inputClass(
                                    "password",
                                    "pl-10 pr-10",
                                )}
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
                    </div>

                    {/* Forgot Password */}
                    <div className="text-end">
                        <Link
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm underline"
                        >
                            {lang("forgot_password")}
                        </Link>
                    </div>
                </div>

                <Button type="submit" className="w-full cursor-pointer" disabled={processing}>
                    {processing
                        ? lang("signing_in")
                        : lang("sign_in")}
                </Button>
            </form>

            <div className="mt-6">
                <GoogleAccount />
                <div className="mt-6 text-center text-sm">
                    {lang("dont_have_account")}{" "}
                    <Link
                        href="/register"
                        className="underline text-blue-500 hover:text-blue-600"
                    >
                        {lang("sign_up")}
                    </Link>
                </div>
            </div>
        </>
    );
}

LoginContent.layout = (page) => <AuthLayout type="login">{page}</AuthLayout>;

export default LoginContent;
