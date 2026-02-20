import React from "react";

export function StepIndicator({
    currentStep,
    steps = ["Jenis Usaha", "Info Toko", "Lokasi"],
}) {
    return (
        <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((label, idx) => {
                const step = idx + 1;
                const done = currentStep > step;
                const active = currentStep === step;
                return (
                    <div key={step} className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                    ${done ? "bg-green-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                            >
                                {done ? "✓" : step}
                            </div>
                            <span
                                className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
                            >
                                {label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div
                                className={`w-10 h-0.5 mb-4 ${done ? "bg-green-500" : "bg-muted"}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
