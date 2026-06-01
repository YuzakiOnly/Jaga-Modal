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

function Field({ label, htmlFor, error, children }) {
    return (
        <div className="space-y-1.5">
            <Label
                htmlFor={htmlFor}
                className="text-sm font-medium text-foreground"
            >
                {label}
            </Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
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

    const valueError = useValidation(
        validateLogin,
        lang,
        combinedServerErrors,
        locale,
    );

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

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
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
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                        </span>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className={valueError.inputClass("email", "pl-9")}
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
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </span>
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className={valueError.inputClass(
                                "password",
                                "pl-9 pr-10",
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

                <div className="flex justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline transition-colors"
                    >
                        {lang("forgot_password")}
                    </Link>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={processing}
                >
                    {processing ? lang("signing_in") : lang("sign_in")}
                </Button>
            </form>

            <div className="mt-6 space-y-4">
                <GoogleAccount />
                <p className="text-center text-sm text-muted-foreground">
                    {lang("dont_have_account")}{" "}
                    <Link
                        href="/register"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        {lang("sign_up")}
                    </Link>
                </p>
            </div>
        </>
    );
}

LoginContent.layout = (page) => <AuthLayout type="login">{page}</AuthLayout>;
export default LoginContent;
