// resources/js/Layouts/AuthLayout.jsx
import React from "react";
import { BgImage } from "@/components/auth/LoginPage";

export default function AuthLayout({ children, type = "login" }) {
    return (
        <div className="flex pb-8 lg:h-screen lg:pb-0">
            <BgImage type={type} />

            <div className="flex w-full items-center justify-center lg:w-1/2">
                <div className="w-full max-w-md space-y-8 px-4">{children}</div>
            </div>
        </div>
    );
}
