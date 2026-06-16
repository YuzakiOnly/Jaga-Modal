"use client";

import * as React from "react";
import { SidebarProvider as ShadcnSidebarProvider } from "@/components/ui/sidebar";

export function SidebarProvider({ children, ...props }) {
    return (
        <ShadcnSidebarProvider
            {...props}
            style={{
                "--sidebar-width": "16rem",
                "--sidebar-width-icon": "3rem",
                "--sidebar-transition-duration": "0ms",
            }}
        >
            {children}
        </ShadcnSidebarProvider>
    );
}
