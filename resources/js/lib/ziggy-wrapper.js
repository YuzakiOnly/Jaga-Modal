import { route as ziggyRoute } from "../../../vendor/tightenco/ziggy";
import { Ziggy } from "@/ziggy.js";

let currentStoreSlug = null;

export function setCurrentStoreSlug(slug) {
    if (slug) {
        currentStoreSlug = slug;
    }
}

export function getCurrentStoreSlug() {
    return currentStoreSlug;
}

function routeNeedsStoreSlug(name) {
    const def = Ziggy.routes?.[name];
    if (!def || !def.parameters) return false;
    return def.parameters.includes("storeSlug");
}

function withStoreSlug(name, params) {
    if (!name || !routeNeedsStoreSlug(name)) {
        return params;
    }

    if (!currentStoreSlug) {
        return params;
    }

    if (params == null) {
        return { storeSlug: currentStoreSlug };
    }

    if (Array.isArray(params)) {
        return [currentStoreSlug, ...params];
    }

    if (typeof params === "object") {
        if ("storeSlug" in params) {
            return params;
        }
        return { storeSlug: currentStoreSlug, ...params };
    }

    const def = Ziggy.routes?.[name];
    const paramNames = def?.parameters ?? [];
    const secondParamName = paramNames.find((p) => p !== "storeSlug");

    if (secondParamName) {
        return { storeSlug: currentStoreSlug, [secondParamName]: params };
    }

    return [currentStoreSlug, params];
}

export function route(name, params, absolute, config) {
    const finalParams = withStoreSlug(name, params);
    return ziggyRoute(name, finalParams, absolute, config ?? Ziggy);
}

export default route;