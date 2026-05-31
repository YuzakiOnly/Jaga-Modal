export function SummaryCard({ icon: Icon, label, value, sub, accent }) {
    return (
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                    {label}
                </span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${accent ?? ""}`}>
                {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
    );
}
