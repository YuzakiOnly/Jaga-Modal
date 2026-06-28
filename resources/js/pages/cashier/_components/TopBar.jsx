import { usePage } from "@inertiajs/react";
import { ShieldCheck, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export default function TopBar({ onMenuClick }) {
    const { auth } = usePage().props;
    const storeName = auth?.user?.store?.name ?? "JagaModal";

    const [time, setTime] = useState("");

    useEffect(() => {
        const tick = () =>
            setTime(
                new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }),
            );
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="sticky top-0 z-30 flex items-center gap-3 px-5 py-3 bg-white border-b border-slate-100 font-inter">
            <button
                onClick={onMenuClick}
                className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Menu className="h-5 w-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                    <ShieldCheck
                        size={15}
                        className="text-white"
                        strokeWidth={2.5}
                    />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-semibold text-orange-600 tracking-widest uppercase">
                        JagaModal
                    </span>
                    <span className="text-sm font-bold text-slate-800 leading-tight">
                        {storeName}
                    </span>
                </div>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                Kasir
            </span>

            <span className="text-xs text-slate-400 ml-auto font-mono tabular-nums">
                {time}
            </span>
        </div>
    );
}
