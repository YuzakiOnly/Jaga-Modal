// Register.jsx
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
import { countryCodes, getCountryByValue } from "@/lib/countryCodes";
import { useTranslation } from "@/hooks/useTranslation";

function RegisterContent({ titlePage, showDescription = false }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [countryCode, setCountryCode] = useState("+62");
    const { lang } = useTranslation();

    const selectedCountry = getCountryByValue(countryCode);

    return (
        <>
            <Head title={titlePage} />

            <AuthHeader
                title={lang("create_account")}
                description={lang("fill_details")}
                showDescription={showDescription}
            />

            <form className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                            {lang("name")}
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="w-full mt-1"
                            placeholder={lang("enter_full_name")}
                        />
                    </div>

                    <div>
                        <Label htmlFor="email" className="text-sm font-medium">
                            {lang("email_address")}
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full mt-1"
                            placeholder={lang("enter_email")}
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone" className="text-sm font-medium">
                            {lang("phone_number")}
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
                            {lang("phone_example")}: {countryCode} 81234567890
                        </p>
                    </div>

                    <div>
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            {lang("password")}
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                className="w-full mt-1 pr-10"
                                placeholder={lang("create_password")}
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
                        {lang("sign_up")}
                    </Button>
                </div>
            </form>

            <div>
                <GoogleAccount />

                <div className="mt-6 text-center text-sm">
                    {lang("already_have_account")}{" "}
                    <Link
                        href="/login"
                        className="underline text-blue-500 hover:text-blue-600"
                    >
                        {lang("sign_in")}
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