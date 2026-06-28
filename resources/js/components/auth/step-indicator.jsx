import { Check } from "lucide-react";

const STEPS = [
    { id: 1, label: "Jenis Usaha" },
    { id: 2, label: "Info Toko" },
    { id: 3, label: "Lokasi" },
];

export function StepIndicator({ currentStep }) {
    return (
        <div className="mb-7 font-inter">
            <div className="relative flex items-start justify-between">
                <div className="absolute top-[18px] left-0 right-0 flex px-[36px]">
                    {STEPS.slice(0, -1).map((step) => (
                        <div
                            key={step.id}
                            className="flex-1 h-0.5 transition-all duration-300"
                            style={{
                                backgroundColor:
                                    currentStep > step.id
                                        ? "#fe5e00"
                                        : "#e8d9ce",
                            }}
                        />
                    ))}
                </div>

                {STEPS.map((step) => {
                    const isComplete = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div
                            key={step.id}
                            className="relative z-10 flex flex-col items-center"
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                    isComplete
                                        ? "border-[#fe5e00] bg-[#fe5e00] text-white"
                                        : isActive
                                          ? "border-[#fe5e00] bg-[#fff3e8] text-[#fe5e00]"
                                          : "border-[#e8d9ce] bg-white text-[#c2a89c]"
                                }`}
                            >
                                {isComplete ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <span className="text-sm font-semibold">
                                        {step.id}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`mt-1.5 text-[11px] font-medium whitespace-nowrap ${
                                    isActive
                                        ? "text-[#fe5e00]"
                                        : isComplete
                                          ? "text-[#1a1110]"
                                          : "text-[#c2a89c]"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
