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
    Send,
    RefreshCw,
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
                    <>
                        Kode 6 digit telah dikirim ke{" "}
                        <span className="font-semibold text-foreground">
                            {phone}
                        </span>{" "}
                        via WhatsApp / SMS.
                    </>
                }
                showDescription
            />

            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
                {/* OTP inputs */}
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
                                className={`h-12 w-11 text-center text-lg font-bold tracking-widest transition-all ${
                                    hasError
                                        ? "border-destructive bg-destructive/5 focus-visible:ring-destructive"
                                        : codeComplete && !hasError
                                          ? "border-emerald-500 bg-emerald-50/50 focus-visible:ring-emerald-500 dark:bg-emerald-950/20"
                                          : ""
                                }`}
                            />
                        ))}
                    </div>

                    {/* Error */}
                    {(hasError || localError) && (
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{hasError ? errorMsg : localError}</span>
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
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

            {/* Resend section */}
            <div className="mt-6 space-y-3 text-center">
                <p className="text-sm text-muted-foreground">
                    Tidak menerima kode?
                </p>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={resending || countdown > 0}
                    className="min-w-40"
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
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{resendMessage}</span>
                    </div>
                )}

                {resendError && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{resendError}</span>
                    </div>
                )}

                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Kode berlaku 10 menit
                </p>
            </div>
        </>
    );
}

VerifyPhoneContent.layout = (page) => (
    <AuthLayout type="register">{page}</AuthLayout>
);
export default VerifyPhoneContent;
