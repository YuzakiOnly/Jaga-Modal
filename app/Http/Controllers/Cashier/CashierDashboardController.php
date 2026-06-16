<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Expense;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashierDashboardController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        $period = $request->input('period', 'hari_ini');

        $selectedMonth = $request->input('month', now()->format('Y-m'));
        $selectedDate = Carbon::parse($selectedMonth . '-01');

        $cashBalance = Store::computeCashBalance($storeId);

        $todayStats = Transaction::forStore($storeId)
            ->completed()
            ->whereDate('transacted_at', today())
            ->selectRaw('SUM(total) as today_revenue, COUNT(*) as today_transactions, AVG(total) as avg_transaction')
            ->first();

        $todayProductsSold = TransactionItem::whereHas(
            'transaction',
            fn($q) => $q->forStore($storeId)->completed()->whereDate('transacted_at', today())
        )->sum('qty');

        $todayExpense = Expense::forStore($storeId)
            ->whereDate('expensed_at', today())
            ->where('type', '!=', 'store_transfer_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfDay();

        $weeklyStats = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$weekStart, $weekEnd])
            ->selectRaw('SUM(total) as weekly_revenue, COUNT(*) as weekly_transactions')
            ->first();

        $weeklyProductsSold = TransactionItem::whereHas(
            'transaction',
            fn($q) => $q->forStore($storeId)->completed()->whereBetween('transacted_at', [$weekStart, $weekEnd])
        )->sum('qty');

        $weeklyExpense = Expense::forStore($storeId)
            ->whereBetween('expensed_at', [$weekStart, $weekEnd])
            ->where('type', '!=', 'store_transfer_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $monthlyStats = Transaction::forStore($storeId)
            ->completed()
            ->whereMonth('transacted_at', now()->month)
            ->whereYear('transacted_at', now()->year)
            ->selectRaw('SUM(total) as monthly_revenue, COUNT(*) as monthly_transactions')
            ->first();

        $monthlyProductsSold = TransactionItem::whereHas(
            'transaction',
            fn($q) => $q->forStore($storeId)->completed()
                ->whereMonth('transacted_at', now()->month)
                ->whereYear('transacted_at', now()->year)
        )->sum('qty');

        $monthlyExpense = Expense::forStore($storeId)
            ->whereMonth('expensed_at', now()->month)
            ->whereYear('expensed_at', now()->year)
            ->where('type', '!=', 'store_transfer_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $salesChart = $this->getMonthlyChart($storeId, $selectedDate);

        [$periodStart, $periodEnd] = match ($period) {
            'minggu_ini' => [now()->startOfWeek(), now()->endOfDay()],
            'bulan_ini' => [now()->startOfMonth(), now()->endOfDay()],
            default => [today()->startOfDay(), today()->endOfDay()],
        };

        $recentTransactions = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$periodStart, $periodEnd])
            ->latest('transacted_at')
            ->limit(20)
            ->get(['id', 'total', 'payment_method', 'transacted_at']);

        $todayRevenue = (float) ($todayStats->today_revenue ?? 0);
        $weeklyRevenue = (float) ($weeklyStats->weekly_revenue ?? 0);
        $monthlyRevenue = (float) ($monthlyStats->monthly_revenue ?? 0);

        $yesterdayRevenue = Transaction::forStore($storeId)
            ->completed()
            ->whereDate('transacted_at', today()->subDay())
            ->sum('total');

        $trendHariIni = $this->calcTrend($todayRevenue, (float) $yesterdayRevenue);

        $lastWeekStart = now()->startOfWeek()->subWeek();
        $lastWeekEnd = now()->subWeek()->endOfDay();
        $lastWeekRevenue = (float) Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$lastWeekStart, $lastWeekEnd])
            ->sum('total');

        $trendMingguIni = $this->calcTrend($weeklyRevenue, $lastWeekRevenue);

        $lastMonthStart = now()->startOfMonth()->subMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        $lastMonthRevenue = (float) Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('total');

        $trendBulanIni = $this->calcTrend($monthlyRevenue, $lastMonthRevenue);

        $avgTransaction = (float) ($todayStats->avg_transaction ?? 0);
        if ($avgTransaction == 0 && ($weeklyStats->weekly_transactions ?? 0) > 0) {
            $avgTransaction = $weeklyRevenue / $weeklyStats->weekly_transactions;
        }

        $availableMonths = $this->getAvailableMonths($storeId);

        $todayNet = $todayRevenue - (float) $todayExpense;
        $weeklyNet = $weeklyRevenue - (float) $weeklyExpense;
        $monthlyNet = $monthlyRevenue - (float) $monthlyExpense;

        $yesterdayExpense = Expense::forStore($storeId)
            ->whereDate('expensed_at', today()->subDay())
            ->where('type', '!=', 'store_transfer_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $lastWeekExpense = Expense::forStore($storeId)
            ->whereBetween('expensed_at', [$lastWeekStart, $lastWeekEnd])
            ->where('type', '!=', 'store_transfer_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        $lastMonthExpense = Expense::forStore($storeId)
            ->whereBetween('expensed_at', [$lastMonthStart, $lastMonthEnd])
            ->where('type', '!=', 'store_transfer_in')
            ->get()
            ->sum(fn($e) => $e->total_amount);

        return Inertia::render('cashier/dashboard/page', [
            'stats' => [
                'cash_balance' => (float) max(0, $cashBalance),

                'today_revenue' => $todayRevenue,
                'today_transactions' => (int) ($todayStats->today_transactions ?? 0),
                'today_products_sold' => (int) $todayProductsSold,
                'today_expense' => (float) $todayExpense,
                'today_net' => $todayNet,
                'today_previous_revenue' => (float) $yesterdayRevenue,
                'today_previous_expense' => (float) $yesterdayExpense,
                'today_previous_label' => 'Kemarin',

                'weekly_revenue' => $weeklyRevenue,
                'weekly_transactions' => (int) ($weeklyStats->weekly_transactions ?? 0),
                'weekly_products_sold' => (int) $weeklyProductsSold,
                'weekly_expense' => (float) $weeklyExpense,
                'weekly_net' => $weeklyNet,
                'weekly_previous_revenue' => $lastWeekRevenue,
                'weekly_previous_expense' => (float) $lastWeekExpense,
                'weekly_previous_label' => 'Minggu Lalu',

                'monthly_revenue' => $monthlyRevenue,
                'monthly_transactions' => (int) ($monthlyStats->monthly_transactions ?? 0),
                'monthly_products_sold' => (int) $monthlyProductsSold,
                'monthly_expense' => (float) $monthlyExpense,
                'monthly_net' => $monthlyNet,
                'monthly_previous_revenue' => $lastMonthRevenue,
                'monthly_previous_expense' => (float) $lastMonthExpense,
                'monthly_previous_label' => 'Bulan Lalu',

                'avg_transaction' => $avgTransaction,

                'revenue_trend' => [
                    'hari_ini' => $trendHariIni,
                    'minggu_ini' => $trendMingguIni,
                    'bulan_ini' => $trendBulanIni,
                ],
            ],
            'sales_chart' => $salesChart,
            'recent_transactions' => $recentTransactions,
            'filters' => [
                'period' => $period,
                'month' => $selectedMonth,
            ],
            'available_months' => $availableMonths,
            'current_month_name' => now()->isoFormat('MMMM YYYY'),
        ]);
    }

    private function calcTrend(float $current, float $previous): ?int
    {
        if ($previous <= 0) {
            return null;
        }
        $result = round((($current - $previous) / $previous) * 100);
        return $result == 0 ? 0 : (int) $result;
    }

    private function getMonthlyChart($storeId, Carbon $date): array
    {
        $chart = [];
        $daysInMonth = $date->daysInMonth;
        $startDate = $date->copy()->startOfMonth()->startOfDay();
        $endDate = $date->copy()->endOfMonth()->endOfDay();

        $transactions = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])
            ->selectRaw('DAY(transacted_at) as day, SUM(total) as revenue, COUNT(*) as count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $data = $transactions->get($day);
            $chart[] = [
                'date' => (string) $day,
                'revenue' => (float) ($data->revenue ?? 0),
                'count' => (int) ($data->count ?? 0),
            ];
        }

        return $chart;
    }

    private function getAvailableMonths($storeId): array
    {
        $months = Transaction::forStore($storeId)
            ->completed()
            ->where('total', '>', 0)
            ->where('transacted_at', '<=', now())
            ->selectRaw('DISTINCT DATE_FORMAT(transacted_at, "%Y-%m") as month_value')
            ->orderBy('month_value', 'desc')
            ->get();

        if ($months->isEmpty()) {
            $result = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $result[] = [
                    'value' => $date->format('Y-m'),
                    'label' => $date->isoFormat('MMMM YYYY'),
                ];
            }
            return $result;
        }

        return $months->map(function ($m) {
            $date = Carbon::parse($m->month_value . '-01');
            return [
                'value' => $date->format('Y-m'),
                'label' => $date->isoFormat('MMMM YYYY'),
            ];
        })->unique('value')->values()->toArray();
    }
}