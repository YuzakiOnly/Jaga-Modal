import { useState, useRef } from "react";

/**
 * @param {Function} validateFn
 * @param {Function} lang
 * @param {Object}   serverErrors
 * @param {string}   locale        
 */
export function useValidation(validateFn, lang, serverErrors = {}, locale = "") {
    const latestDataRef = useRef(null);
    const touchedRef = useRef({});
    const prevLocaleRef = useRef(locale);

    const [clientErrors, setClientErrors] = useState({});
    const [touched, setTouched] = useState({});

    if (
        prevLocaleRef.current !== locale &&
        latestDataRef.current !== null &&
        Object.keys(touchedRef.current).length > 0
    ) {
        prevLocaleRef.current = locale;
        const errs = validateFn(latestDataRef.current, lang);
        setClientErrors(errs);
    } else if (prevLocaleRef.current !== locale) {
        prevLocaleRef.current = locale;
    }

    const validate = (data) => {
        latestDataRef.current = data;
        const errs = validateFn(data, lang);
        setClientErrors(errs);
        return errs;
    };

    const errors = { ...clientErrors, ...serverErrors };

    const onBlur = (field, data) => {
        touchedRef.current = { ...touchedRef.current, [field]: true };
        setTouched({ ...touchedRef.current });
        validate(data);
    };

    const onChange = (field, data) => {
        if (touchedRef.current[field]) validate(data);
    };

    const onSubmit = (fields, data) => {
        const allTouched = fields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
        touchedRef.current = allTouched;
        setTouched(allTouched);
        const errs = validate(data);
        return Object.keys(errs).length === 0;
    };

    const showError = (field) => touched[field] && field in errors;

    const inputClass = (field, extra = "") =>
        ["w-full", extra, showError(field) ? "border-destructive focus-visible:ring-destructive" : ""]
            .filter(Boolean)
            .join(" ");

    const iconClass = (field) =>
        showError(field) ? "text-destructive" : "text-muted-foreground";

    return { errors, touched, showError, inputClass, iconClass, onBlur, onChange, onSubmit };
} 