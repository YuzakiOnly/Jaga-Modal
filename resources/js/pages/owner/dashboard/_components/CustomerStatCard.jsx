// _components/CustomerStatCard.jsx
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerStatCard({ customerStats, period }) {
    const total = customerStats?.total ?? 0;

    return (
        <Card className="h-full">
            <CardContent className="p-3 sm:p-4 flex flex-col justify-between h-full">
                <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">
                        Pelanggan Unik
                    </p>
                </div>
                <div>
                    <p className="text-2xl sm:text-3xl font-bold tabular-nums">
                        {total}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {period}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
