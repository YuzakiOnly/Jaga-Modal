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
    Smartphone,
    Clock,
    Send,
    MessageCircle,
} from "lucide-react";

function VerifyPhoneContent({ titlePage, phone, errors: serverErrors }) {
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [resendError, setResendError] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [localError, setLocalError] = useState("");
    const inputsRef = useRef([]);

    const { data, setData, processing, errors, setError, clearErrors } =
        useForm({ code: "" });

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
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

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
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

        if (pasted) {
            const newDigits = [...digits];
            for (let i = 0; i < pasted.length; i++) {
                newDigits[i] = pasted[i];
            }
            setDigits(newDigits);
            setData("code", newDigits.join(""));
            setLocalError("");
            clearErrors();

            const lastFilledIndex = Math.min(pasted.length - 1, 5);
            inputsRef.current[lastFilledIndex]?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        setLocalError("");

        const code = digits.join("");

        if (code.length < 6) {
            setLocalError("Please enter the complete 6-digit code.");
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
            setResendMessage(
                res.data.message ?? "Code resent to your WhatsApp/SMS!",
            );
            setCountdown(60);
        } catch (error) {
            setResendError(
                error.response?.data?.message ??
                    "Failed to resend. Please try again.",
            );
            setCountdown(30);
        } finally {
            setResending(false);
        }
    };

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const hasError = !!(errors.code || errors.error || serverErrors?.code);

    return (
        <>
            <Head title={titlePage} />

            <AuthHeader
                title="Verify Your Phone Number"
                description={
                    <>
                        We sent a 6-digit code to your WhatsApp/SMS at{" "}
                        <span className="font-semibold text-foreground">
                            {phone}
                        </span>
                        . Enter it below to continue.
                    </>
                }
                showDescription
            />

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span>
                    Code sent via{" "}
                    <span className="font-semibold">WhatsApp</span> or{" "}
                    <span className="font-semibold">SMS</span>
                </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
                <div className="space-y-3">
                    <div
                        className="flex justify-center gap-2"
                        onPaste={handlePaste}
                    >
                        {digits.map((digit, i) => (
                            <div key={i} className="relative">
                                <Input
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
                                    className={`w-11 h-12 text-center text-xl font-bold tracking-widest transition-colors ${
                                        hasError
                                            ? "border-red-500 ring-red-500/20 focus-visible:ring-red-500 bg-red-50"
                                            : ""
                                    }`}
                                    autoFocus={i === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {hasError && (
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-full">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {errors.code ||
                                        serverErrors?.code ||
                                        "Invalid code. Please try again."}
                                </span>
                            </div>
                        </div>
                    )}

                    {localError && (
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-full">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{localError}</span>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing || digits.join("").length < 6}
                    size="lg"
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Verify Phone Number
                        </>
                    )}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                    <Smartphone className="h-4 w-4" />
                    <span>Didn't receive a code?</span>
                </div>

                <div className="space-y-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleResend}
                        disabled={resending || countdown > 0}
                        className="min-w-50"
                        size="sm"
                    >
                        {resending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : countdown > 0 ? (
                            <>
                                <Clock className="mr-2 h-4 w-4" />
                                Resend in {formatCountdown(countdown)}
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Resend Code
                            </>
                        )}
                    </Button>

                    {resendMessage && (
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 py-2 px-4 rounded-full">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {resendMessage}
                                </span>
                            </div>
                        </div>
                    )}

                    {resendError && (
                        <div className="flex justify-center">
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 py-2 px-4 rounded-full">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{resendError}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                    <Clock className="h-3 w-3" />
                    <span>Code expires in 10 minutes</span>
                </div>
            </div>
        </>
    );
}

VerifyPhoneContent.layout = (page) => (
    <AuthLayout type="register">{page}</AuthLayout>
);

export default VerifyPhoneContent;
