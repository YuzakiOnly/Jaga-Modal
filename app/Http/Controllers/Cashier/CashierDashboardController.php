<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Expense;
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

        $totalRevenueAll = Transaction::forStore($storeId)->completed()->sum('total');
        $totalExpenseAll = Expense::forStore($storeId)->get()->sum(fn($e) => $e->total_amount);
        $cashBalance = $totalRevenueAll - $totalExpenseAll;

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

        $yesterdayRevenue = Transaction::forStore($storeId)
            ->completed()
            ->whereDate('transacted_at', today()->subDay())
            ->sum('total');

        $todayRevenue = (float) ($todayStats->today_revenue ?? 0);
        $revenueTrend = 0;
        if ($yesterdayRevenue > 0) {
            $revenueTrend = round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1);
        } elseif ($todayRevenue > 0) {
            $revenueTrend = 100;
        }

        $avgTransaction = (float) ($todayStats->avg_transaction ?? 0);
        if ($avgTransaction == 0 && ($weeklyStats->weekly_transactions ?? 0) > 0) {
            $avgTransaction = (float) ($weeklyStats->weekly_revenue / $weeklyStats->weekly_transactions);
        }

        $availableMonths = $this->getAvailableMonths($storeId);

        return Inertia::render('cashier/dashboard/page', [
            'stats' => [
                'cash_balance' => (float) $cashBalance,
                'today_revenue' => $todayRevenue,
                'today_transactions' => (int) ($todayStats->today_transactions ?? 0),
                'today_products_sold' => (int) $todayProductsSold,
                'today_expense' => (float) $todayExpense,
                'today_net' => $todayRevenue - (float) $todayExpense,

                'weekly_revenue' => (float) ($weeklyStats->weekly_revenue ?? 0),
                'weekly_transactions' => (int) ($weeklyStats->weekly_transactions ?? 0),
                'weekly_products_sold' => (int) $weeklyProductsSold,
                'weekly_expense' => (float) $weeklyExpense,
                'weekly_net' => (float) ($weeklyStats->weekly_revenue ?? 0) - (float) $weeklyExpense,

                'monthly_revenue' => (float) ($monthlyStats->monthly_revenue ?? 0),
                'monthly_transactions' => (int) ($monthlyStats->monthly_transactions ?? 0),
                'monthly_products_sold' => (int) $monthlyProductsSold,
                'monthly_expense' => (float) $monthlyExpense,
                'monthly_net' => (float) ($monthlyStats->monthly_revenue ?? 0) - (float) $monthlyExpense,

                'avg_transaction' => $avgTransaction,
                'revenue_trend' => $revenueTrend,
            ],
            'sales_chart' => $salesChart,
            'recent_transactions' => $recentTransactions,
            'filters' => [
                'period' => $period,
                'month' => $selectedMonth,
            ],
            'available_months' => $availableMonths,
        ]);
    }

    private function getMonthlyChart($storeId, Carbon $date)
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

    private function getAvailableMonths($storeId)
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