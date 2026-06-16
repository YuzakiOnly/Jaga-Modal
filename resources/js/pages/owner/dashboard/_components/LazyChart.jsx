import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const LoadingFallback = () => (
    <div className="h-[320px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
);

const LoadingFallbackSmall = () => (
    <div className="h-[320px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
    </div>
);

// Lazy load komponen grafik
const LazyMonthlyRevenueChart = lazy(() => import("./MonthlyRevenueChart"));
const LazySalesChart = lazy(() => import("./SalesChart"));
const LazyDailyProductChart = lazy(() => import("./DailyProductChart"));
const LazyCustomerTransactionChart = lazy(
    () => import("./CustomerTransactionChart"),
);

export const MonthlyRevenueChart = (props) => (
    <Suspense fallback={<LoadingFallback />}>
        <LazyMonthlyRevenueChart {...props} />
    </Suspense>
);

export const SalesChart = (props) => (
    <Suspense fallback={<LoadingFallback />}>
        <LazySalesChart {...props} />
    </Suspense>
);

export const DailyProductChart = (props) => (
    <Suspense fallback={<LoadingFallbackSmall />}>
        <LazyDailyProductChart {...props} />
    </Suspense>
);

export const CustomerTransactionChart = (props) => (
    <Suspense fallback={<LoadingFallbackSmall />}>
        <LazyCustomerTransactionChart {...props} />
    </Suspense>
);
