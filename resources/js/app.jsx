import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { Ziggy } from "@/ziggy.js";
import { route } from "ziggy-js";
import { TooltipProvider } from "@/components/ui/tooltip";

const appName = import.meta.env.VITE_APP_NAME || "Jaga Modal";

window.route = route;
window.Ziggy = Ziggy;

createInertiaApp({
    title: (title) => {
        return title ? `${title} | ${appName}` : appName;
    },

    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
        let page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(
                `Page not found: ${name}. Available: ${Object.keys(pages).join(", ")}`,
            );
        }

        if (page.default) {
            page.default.layout = page.default.layout || ((page) => page);
        }

        return page;
    },

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <TooltipProvider>
                <App {...props} />
            </TooltipProvider>,
        );
    },
});
