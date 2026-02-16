import { Link } from "@inertiajs/react";
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
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { countryCodes, getCountryByValue } from "@/lib/country-codes";

function RegisterContent({ titlePage, showDescription = false }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [countryCode, setCountryCode] = useState("+62");

    const selectedCountry = getCountryByValue(countryCode);

    return (
        <>
            <Head title={titlePage} />

            <AuthHeader
                title="Create New Account"
                description="Fill in your details to get started"
                showDescription={showDescription}
            />

            <form className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="w-full mt-1"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full mt-1"
                            placeholder="Enter your email address"
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone" className="text-sm font-medium">
                            Phone Number
                        </Label>
                        <div className="flex mt-1 gap-2">
                            <div className="w-32">
                                <Select
                                    value={countryCode}
                                    onValueChange={setCountryCode}
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
                                required
                                className="flex-1"
                                placeholder="81234567890"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Example: {countryCode} 81234567890
                        </p>
                    </div>

                    <div>
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="w-full mt-1 pr-10"
                                placeholder="Create a password"
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
                </div>

                <div>
                    <Button type="submit" className="w-full">
                        Sign up
                    </Button>
                </div>
            </form>

            <div className="mt-6">
                <GoogleAccount />

                <div className="mt-6 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </>
    );
}

RegisterContent.layout = (page) => (
    <AuthLayout type="register">{page}</AuthLayout>
);

export default RegisterContent;
