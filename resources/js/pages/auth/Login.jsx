import { Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/Layouts/AuthLayout";
import { Head } from "@inertiajs/react";
import { AuthHeader, GoogleAccount } from "@/components/auth/LoginPage";
import { useState } from "react";

function LoginContent({ titlePage, showDescription = true }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Head title={titlePage} />

            <AuthHeader
                title="Welcome back"
                description="Please sign in to your account"
                showDescription={showDescription}
            />

            <form className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email" className="sr-only">
                            Email address
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full pl-10"
                                placeholder="Email address"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="password" className="sr-only">
                            Password
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="w-full pl-10 pr-10"
                                placeholder="Password"
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
                    <div className="text-end">
                        <Link
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm underline"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                <div>
                    <Button type="submit" className="w-full">
                        Sign in
                    </Button>
                </div>
            </form>

            <div className="mt-6">
                <GoogleAccount />

                <div className="mt-6 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </>
    );
}

LoginContent.layout = (page) => <AuthLayout type="login">{page}</AuthLayout>;

export default LoginContent;
