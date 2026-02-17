import LanguageSelector from "@/components/language/LanguageSelector";
import { BgImage } from "@/components/auth/LoginPage";

export default function AuthLayout({ children, type }) {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSelector />
            </div>

            <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                <BgImage type={type} />

                <div className="lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
