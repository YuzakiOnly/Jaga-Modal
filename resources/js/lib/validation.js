export function validateLogin(data, lang) {
    const errors = {};

    const emailEmpty = !data.email?.trim();
    const emailInvalid = data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    const passwordEmpty = !data.password;
    const passwordShort = data.password && data.password.length < 8;

    if (emailEmpty || emailInvalid || passwordEmpty || passwordShort) {
        errors.email = lang("validation_email_password_invalid");
        errors.password = "";
    }

    return errors;
}

export function validateRegister(data, lang) {
    const errors = {};

    if (!data.name?.trim()) {
        errors.name = lang("validation_name_required");
    } else if (data.name.trim().length < 2) {
        errors.name = lang("validation_name_min");
    }

    if (!data.username) {
        errors.username = lang("validation_username_required");
    } else if (data.username.length < 3) {
        errors.username = lang("validation_username_min");
    } else if (data.username.length > 20) {
        errors.username = lang("validation_username_max");
    } else if (!/^[a-z0-9_]+$/.test(data.username)) {
        errors.username = lang("validation_username_format");
    }

    if (!data.email?.trim()) {
        errors.email = lang("validation_email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = lang("validation_email_invalid");
    }

    if (!data.phone) {
        errors.phone = lang("validation_phone_required");
    } else if (!/^\d{6,15}$/.test(data.phone)) {
        errors.phone = lang("validation_phone_invalid");
    }

    if (!data.password) {
        errors.password = lang("validation_password_required");
    } else if (data.password.length < 8) {
        errors.password = lang("validation_password_min");
    } else if (!/[A-Z]/.test(data.password)) {
        errors.password = lang("validation_password_uppercase");
    } else if (!/[0-9]/.test(data.password)) {
        errors.password = lang("validation_password_number");
    }

    return errors;
}