// resources/js/lib/formatters.js

/**
 * Format currency ke Rupiah
 * @param {number} value - Nilai yang akan diformat
 * @returns {string} - Format Rupiah (contoh: Rp125.000)
 */
export function formatCurrency(value) {
    if (value === undefined || value === null) {
        return "Rp0"
    }

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

/**
 * Format angka dengan pemisah ribuan
 * @param {number} value - Nilai yang akan diformat
 * @returns {string} - Format angka (contoh: 1.234.567)
 */
export function formatNumber(value) {
    if (value === undefined || value === null) {
        return "0"
    }

    return new Intl.NumberFormat("id-ID").format(value)
}

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {Object} options - Opsi formatting tambahan
 * @returns {string} - Format tanggal (contoh: 28 Mei 2025)
 */
export function formatDate(date, options = {}) {
    if (!date) return ""

    const d = new Date(date)
    const defaultOptions = {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...options
    }

    return d.toLocaleDateString("id-ID", defaultOptions)
}

/**
 * Format tanggal dan waktu ke format Indonesia
 * @param {string|Date} date - Tanggal/waktu yang akan diformat
 * @returns {string} - Format tanggal & waktu (contoh: 28 Mei 2025, 14:30)
 */
export function formatDateTime(date) {
    if (!date) return ""

    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

/**
 * Format persentase
 * @param {number} value - Nilai persentase
 * @returns {string} - Format persentase (contoh: 25.5%)
 */
export function formatPercentage(value) {
    if (value === undefined || value === null) {
        return "0%"
    }
    return `${value}%`
}

/**
 * Format pendek untuk tanggal (tanpa tahun)
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string} - Format pendek (contoh: 28 Mei)
 */
export function formatShortDate(date) {
    if (!date) return ""

    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
    })
}