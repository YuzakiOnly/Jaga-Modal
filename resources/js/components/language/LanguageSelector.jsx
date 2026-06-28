import { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Globe, Check, Loader2 } from "lucide-react";

export default function LanguageSelector() {
    const { locale, available_locales } = usePage().props;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const switchLanguage = (lang) => {
        if (lang === locale || loading) return;

        setLoading(true);

        router.post(
            route("language.switch"),
            { locale: lang },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false);
                    setOpen(false);
                    // Update locale di page props
                    window.location.reload(); // Sementara masih reload
                },
                onError: () => {
                    setLoading(false);
                },
            },
        );
    };

    const getFlag = (lang) => {
        const flags = {
            id: "🇮🇩",
            en: "🇬🇧",
        };
        return flags[lang] || "🌐";
    };

    const getLabel = (lang) => {
        const labels = {
            id: "Indonesia",
            en: "English",
        };
        return labels[lang] || lang;
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 border border-[#e8d9ce] bg-white text-[#1a1110] hover:bg-[#fff3e8] hover:text-[#1a1110]"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#fe5e00]" />
                    ) : (
                        <Globe className="h-4 w-4 text-[#fe5e00]" />
                    )}
                    <span className="hidden sm:inline">
                        {getFlag(locale)} {locale.toUpperCase()}
                    </span>
                    <span className="sm:hidden">{getFlag(locale)}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="min-w-40 border-[#e8d9ce] bg-white text-[#1a1110]"
            >
                {available_locales.map((lang) => (
                    <DropdownMenuItem
                        key={lang}
                        onClick={() => switchLanguage(lang)}
                        className={`flex items-center justify-between gap-4 cursor-pointer hover:bg-[#fff3e8] ${
                            locale === lang
                                ? "text-[#fe5e00]"
                                : "text-[#1a1110]"
                        }`}
                        disabled={loading}
                    >
                        <span>
                            {getFlag(lang)} {getLabel(lang)}
                        </span>
                        {locale === lang && (
                            <Check className="h-4 w-4 text-[#fe5e00]" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
