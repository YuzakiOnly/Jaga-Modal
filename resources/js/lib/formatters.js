// lib/formatters.js

/**
 * Format angka menjadi mata uang Rupiah
 * @param {number} value - Nilai yang akan diformat
 * @param {Object} options - Opsi formatting tambahan
 * @returns {string} String mata uang yang sudah diformat
 */
export function formatCurrency(value, options = {}) {
    if (value === undefined || value === null || isNaN(value)) {
        return "Rp0";
    }

    const defaultOptions = {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };

    return new Intl.NumberFormat("id-ID", {
        ...defaultOptions,
        ...options,
    }).format(value);
}

/**
 * Format angka dengan pemisah ribuan
 * @param {number} value - Nilai yang akan diformat
 * @param {Object} options - Opsi formatting tambahan
 * @returns {string} String angka yang sudah diformat
 */
export function formatNumber(value, options = {}) {
    if (value === undefined || value === null || isNaN(value)) {
        return "0";
    }

    const defaultOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };

    return new Intl.NumberFormat("id-ID", {
        ...defaultOptions,
        ...options,
    }).format(value);
}

/**
 * Format angka desimal
 * @param {number} value - Nilai desimal
 * @param {number} digits - Jumlah digit desimal
 * @returns {string}
 */
export function formatDecimal(value, digits = 2) {
    if (value === undefined || value === null || isNaN(value)) {
        return "0";
    }

    return new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(value);
}

/**
 * Format tanggal ke format Indonesia (contoh: 1 Januari 2024)
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {Object} options - Opsi formatting tambahan
 * @returns {string}
 */
export function formatDate(date, options = {}) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const defaultOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };

    return d.toLocaleDateString("id-ID", {
        ...defaultOptions,
        ...options,
    });
}

/**
 * Format tanggal dan waktu (contoh: 1 Januari 2024, 14:30)
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string}
 */
export function formatDateTime(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Format tanggal pendek (contoh: 1 Jan)
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string}
 */
export function formatShortDate(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
    });
}

/**
 * Format tanggal sangat pendek (contoh: 01/01/24)
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string}
 */
export function formatShortDateSlash(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

/**
 * Format waktu saja (contoh: 14:30)
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string}
 */
export function formatTime(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Format persentase
 * @param {number} value - Nilai persentase
 * @param {number} decimals - Jumlah desimal
 * @returns {string}
 */
export function formatPercentage(value, decimals = 0) {
    if (value === undefined || value === null || isNaN(value)) {
        return "0%";
    }

    if (decimals > 0) {
        return `${formatDecimal(value, decimals)}%`;
    }

    return `${value}%`;
}

/**
 * Convert Date object ke string "YYYY-MM-DD" tanpa timezone shift
 * @param {Date|string} date - Tanggal yang akan dikonversi
 * @returns {string}
 */
export function toDateString(date) {
    if (!date) return "";
    if (typeof date === "string") return date.split("T")[0];

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/**
 * Convert string date ke Date object yang aman
 * @param {string|Date} date - Tanggal yang akan dikonversi
 * @returns {Date|null}
 */
export function toSafeDate(date) {
    if (!date) return null;

    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Format jarak waktu (contoh: 2 jam yang lalu, 3 hari yang lalu)
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string}
 */
export function timeAgo(date) {
    if (!date) return "";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const diff = Math.floor((now - d) / 1000); // detik

    if (diff < 60) return "baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)} minggu yang lalu`;

    return formatDate(date);
}

/**
 * Format angka menjadi format compact (contoh: 1.2K, 1.5M)
 * @param {number} value - Nilai yang akan diformat
 * @returns {string}
 */
export function formatCompactNumber(value) {
    if (value === undefined || value === null || isNaN(value)) {
        return "0";
    }

    return new Intl.NumberFormat("id-ID", {
        notation: "compact",
        compactDisplay: "short",
    }).format(value);
}

/**
 * Format harga dengan kustom (shortcut untuk formatCurrency)
 * @param {number} value - Nilai yang akan diformat
 * @returns {string}
 */
export const fmt = (value) => formatCurrency(value);