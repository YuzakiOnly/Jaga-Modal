import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { props } = usePage();
    const translations = props.translations || {};

    const lang = (key, fallback = '') => {
        return translations[key] || fallback || key;
    };

    return { lang };
}