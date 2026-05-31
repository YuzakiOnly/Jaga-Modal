import { Banknote, Smartphone, CreditCard } from "lucide-react";

export const fmt = (n) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n ?? 0);

export const fmtNum = (n) => new Intl.NumberFormat("id-ID").format(n ?? 0);

export const paymentIcon = (method) => {
    if (method === "cash") return Banknote;
    if (method === "qris") return Smartphone;
    return CreditCard;
};

export const paymentLabel = (method) => {
    if (method === "cash") return "Tunai";
    if (method === "qris") return "QRIS";
    return method ?? "-";
};

export const PERIODS = [
    { key: "hari_ini", label: "Hari Ini" },
    { key: "minggu_ini", label: "Minggu Ini" },
    { key: "bulan_ini", label: "Bulan Ini" },
];
