import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Check, Languages } from "lucide-react";
import ReactCountryFlag from "react-country-flag";

const languageFlags = {
    id: "ID",
    en: "US",
    ja: "JP",
};

const languageNames = {
    id: "Indonesia",
    en: "English",
    ja: "日本語",
};

function getCsrfToken() {
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="));
    return match ? decodeURIComponent(match.split("=")[1]) : "";
}

export default function LanguageSelector() {
    const { props } = usePage();
    const currentLocale = props.locale || "id";
    const availableLocales = props.available_locales || ["id", "en", "ja"];
    const [isChanging, setIsChanging] = useState(false);

    const switchLanguage = async (locale) => {
        if (locale === currentLocale || isChanging) return;

        setIsChanging(true);

        try {
            const response = await fetch("/language/switch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": getCsrfToken(),
                    Accept: "application/json",
                },
                body: JSON.stringify({ locale }),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                console.error("Gagal ganti bahasa:", response.status);
                setIsChanging(false);
            }
        } catch (error) {
            console.error("Error ganti bahasa:", error);
            setIsChanging(false);
        }
    };

    const currentLang = {
        code: currentLocale,
        name: languageNames[currentLocale] || "Indonesia",
        flag: languageFlags[currentLocale] || "ID",
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white shadow-sm hover:bg-gray-50 border-gray-200"
                    disabled={isChanging}
                >
                    <Languages className="h-4 w-4" />
                    <ReactCountryFlag
                        countryCode={currentLang.flag}
                        svg
                        style={{ width: "16px", height: "16px" }}
                    />
                    <span className="hidden sm:inline">
                        {isChanging ? "..." : currentLang.name}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {availableLocales.map((locale) => (
                    <DropdownMenuItem
                        key={locale}
                        onSelect={(e) => {
                            e.preventDefault();
                            switchLanguage(locale);
                        }}
                        className={`gap-2 cursor-pointer ${
                            currentLocale === locale ? "bg-gray-100" : ""
                        } ${isChanging ? "opacity-50 pointer-events-none" : ""}`}
                    >
                        <ReactCountryFlag
                            countryCode={languageFlags[locale]}
                            svg
                            style={{ width: "18px", height: "18px" }}
                        />
                        <div className="flex justify-between items-center gap-10">
                            <span>{languageNames[locale]}</span>
                            {currentLocale === locale && (
                                <Check className="h-4 w-4 text-green-600" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
