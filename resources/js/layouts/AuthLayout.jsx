import LanguageSelector from "@/components/language/LanguageSelector";
import { BrandPanel } from "@/components/auth/LoginPage";

export default function AuthLayout({ children, type }) {
    return (
        <div className="relative h-screen overflow-hidden bg-[#fff8f0] lg:grid lg:grid-cols-[1.05fr_1fr] font-inter">
            <BrandPanel type={type} />

            <div className="relative h-full overflow-y-auto">
                <div
                    className="absolute inset-0 -z-10 opacity-[0.4]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #fe5e0022 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                    }}
                />

                <div className="absolute top-4 right-4 z-50 lg:top-6 lg:right-6 hidden">
                    <LanguageSelector />
                </div>

                <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-8 lg:px-10">
                    <div className="w-full max-w-[500px]">
                        <div className="relative rounded-[28px] bg-white shadow-[0_2px_0_#00000008,0_24px_48px_-24px_#fe5e0033] ring-1 ring-[#fe5e0014]">
                            <svg
                                className="absolute -top-[1px] left-0 w-full text-[#fff8f0]"
                                height="14"
                                viewBox="0 0 400 14"
                                preserveAspectRatio="none"
                                fill="none"
                            >
                                <path
                                    d="M0 14 L0 6 L8 14 L16 6 L24 14 L32 6 L40 14 L48 6 L56 14 L64 6 L72 14 L80 6 L88 14 L96 6 L104 14 L112 6 L120 14 L128 6 L136 14 L144 6 L152 14 L160 6 L168 14 L176 6 L184 14 L192 6 L200 14 L208 6 L216 14 L224 6 L232 14 L240 6 L248 14 L256 6 L264 14 L272 6 L280 14 L288 6 L296 14 L304 6 L312 14 L320 6 L328 14 L336 6 L344 14 L352 6 L360 14 L368 6 L376 14 L384 6 L392 14 L400 6 L400 0 L0 0 Z"
                                    fill="currentColor"
                                />
                            </svg>
                            <div className="px-7 pt-9 pb-8 sm:px-9">
                                {children}
                            </div>
                        </div>

                        <p className="mt-5 text-center text-xs font-medium text-[#a8665a] font-inter">
                            JagaModal &middot; Teman Catat Usaha UMKM
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
