export const avatarColors = [
    "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
];

export function Avatar({ name }) {
    const initials =
        name
            ?.split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase() ?? "?";
    const idx = (name?.charCodeAt(0) ?? 0) % avatarColors.length;
    return (
        <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColors[idx]}`}
        >
            {initials}
        </div>
    );
}