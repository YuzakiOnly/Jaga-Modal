import { useForm, Head, router } from "@inertiajs/react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import AuthLayout from "@/Layouts/AuthLayout";
import { AuthHeader } from "@/components/auth/LoginPage";
import axios from "axios";
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Clock,
    RefreshCw,
    ShieldCheck,
    Smartphone,
} from "lucide-react";

function VerifyPhoneContent({ titlePage, phone, errors: serverErrors }) {
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [resendError, setResendError] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [localError, setLocalError] = useState("");
    const inputsRef = useRef([]);

    const { data, setData, processing, errors, clearErrors } = useForm({
        code: "",
    });

    useEffect(() => {
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [countdown]);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const updated = [...digits];
        updated[index] = value;
        setDigits(updated);
        setData("code", updated.join(""));
        setLocalError("");
        clearErrors();
        if (value && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        if (!pasted) return;
        const newDigits = [...digits];
        for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
        setDigits(newDigits);
        setData("code", newDigits.join(""));
        setLocalError("");
        clearErrors();
        inputsRef.current[Math.min(pasted.length - 1, 5)]?.focus();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        setLocalError("");
        const code = digits.join("");
        if (code.length < 6) {
            setLocalError("Masukkan 6 digit kode verifikasi.");
            return;
        }
        router.post("/verify-phone", { code });
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setResending(true);
        setResendMessage("");
        setResendError("");
        try {
            const res = await axios.post("/verify-phone/resend");
            setResendMessage(res.data.message ?? "Kode dikirim ulang!");
            setCountdown(60);
        } catch (error) {
            setResendError(
                error.response?.data?.message ??
                    "Gagal mengirim ulang. Coba lagi.",
            );
            setCountdown(30);
        } finally {
            setResending(false);
        }
    };

    const formatCountdown = (s) =>
        `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    const hasError = !!(errors.code || errors.error || serverErrors?.code);
    const errorMsg =
        errors.code || serverErrors?.code || "Kode tidak valid. Coba lagi.";
    const codeComplete = digits.join("").length === 6;

    return (
        <>
            <Head title={titlePage} />

            <AuthHeader
                title="Verifikasi Nomor HP"
                description={
                    <span className="flex flex-col gap-1">
                        <span className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-[#fe5e00]" />
                            <span>
                                Kode 6 digit dikirim ke{" "}
                                <span className="font-semibold text-[#1a1110]">
                                    {phone}
                                </span>
                            </span>
                        </span>
                        <span className="text-xs text-[#c2a89c]">
                            via WhatsApp / SMS
                        </span>
                    </span>
                }
                showDescription
            />

            <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-6 font-inter"
                noValidate
            >
                <div className="space-y-3">
                    <div
                        className="flex justify-center gap-2"
                        onPaste={handlePaste}
                    >
                        {digits.map((digit, i) => (
                            <Input
                                key={i}
                                ref={(el) => (inputsRef.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) =>
                                    handleChange(i, e.target.value)
                                }
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                disabled={processing}
                                autoFocus={i === 0}
                                className={`h-14 w-12 text-center text-xl font-bold tracking-widest transition-all border-[#e8d9ce] bg-[#fffaf5] text-[#1a1110] focus-visible:border-[#fe5e00] focus-visible:ring-[#fe5e00]/20 ${
                                    hasError
                                        ? "border-red-400 bg-red-50 focus-visible:ring-red-200"
                                        : codeComplete && !hasError
                                          ? "border-emerald-500 bg-emerald-50 focus-visible:ring-emerald-200"
                                          : ""
                                }`}
                            />
                        ))}
                    </div>

                    {(hasError || localError) && (
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 border border-red-200">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{hasError ? errorMsg : localError}</span>
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#fe5e00] hover:bg-[#e55400] text-white border-0 shadow-md shadow-[#fe5e00]/25 transition-colors"
                    size="lg"
                    disabled={processing || !codeComplete}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Memverifikasi...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Verifikasi
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-6 space-y-3 text-center">
                <p className="text-sm text-[#8a6a62]">Tidak menerima kode?</p>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={resending || countdown > 0}
                    className="min-w-40 border-[#e8d9ce] text-[#1a1110] hover:bg-[#fff3e8] hover:text-[#1a1110]"
                >
                    {resending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Mengirim...
                        </>
                    ) : countdown > 0 ? (
                        <>
                            <Clock className="mr-2 h-4 w-4" /> Kirim ulang{" "}
                            {formatCountdown(countdown)}
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" /> Kirim Ulang
                        </>
                    )}
                </Button>

                {resendMessage && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{resendMessage}</span>
                    </div>
                )}

                {resendError && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 border border-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{resendError}</span>
                    </div>
                )}

                <p className="flex items-center justify-center gap-1.5 text-xs text-[#c2a89c]">
                    <Clock className="h-3 w-3" />
                    Kode berlaku 10 menit
                </p>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#c2a89c]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Keamanan data terjamin</span>
            </div>
        </>
    );
}

VerifyPhoneContent.layout = (page) => (
    <AuthLayout type="register">{page}</AuthLayout>
);
export default VerifyPhoneContent;
