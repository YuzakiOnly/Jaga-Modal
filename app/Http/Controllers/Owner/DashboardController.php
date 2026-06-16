<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Expense;
use App\Models\Product;
use App\Models\OwnerWalletTransaction;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $storeId = auth()->user()->store_id;

        if (!$storeId) {
            return redirect()->route('store.setup')
                ->with('error', 'Please setup your store first.');
        }

        $startDateParam = $request->input('start_date');
        $endDateParam = $request->input('end_date');
        $comparisonKey = $request->input('comparison', 'last_7_days');

        if ($startDateParam && $endDateParam) {
            $startDate = Carbon::parse($startDateParam)->startOfDay();
            $endDate = Carbon::parse($endDateParam)->endOfDay();
            $periodLabel = Carbon::parse($startDateParam)->isoFormat('D MMMM YYYY');
            if ($startDateParam !== $endDateParam) {
                $periodLabel = Carbon::parse($startDateParam)->isoFormat('D MMMM YYYY') . ' - ' . Carbon::parse($endDateParam)->isoFormat('D MMMM YYYY');
            }
        } else {
            $startDate = now()->startOfDay();
            $endDate = now()->endOfDay();
            $periodLabel = 'Hari Ini';
        }

        $salesMonth = $request->input('sales_month', now()->format('Y-m'));
        $productMonth = $request->input('product_month', now()->format('Y-m'));
        $customerMonth = $request->input('customer_month', now()->format('Y-m'));

        $salesDate = Carbon::parse($salesMonth . '-01');
        $productDate = Carbon::parse($productMonth . '-01');
        $customerDate = Carbon::parse($customerMonth . '-01');

        $currentData = $this->getPeriodData($storeId, $startDate, $endDate);

        $periodTransactions = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])
            ->count();

        $avgTransaction = $periodTransactions > 0
            ? $currentData['total_revenue'] / $periodTransactions
            : 0;

        $comparisons = $this->buildComparisonsFromRange(
            $storeId,
            $startDate,
            $endDate,
            $currentData,
            $avgTransaction
        );

        $salesEffectiveEnd = $this->getEffectiveEnd($salesDate);
        $productEffectiveEnd = $this->getEffectiveEnd($productDate);
        $customerEffectiveEnd = $this->getEffectiveEnd($customerDate);

        $salesChart = $this->buildDailyChart($storeId, $salesDate, $salesEffectiveEnd);
        $dailyProductData = $this->buildDailyProductChart($storeId, $productDate, $productEffectiveEnd);
        $customerTransactionData = $this->buildCustomerTransactionChart($storeId, $customerDate, $customerEffectiveEnd);

        $startOfMonth = $salesDate->copy()->startOfMonth()->startOfDay();
        $effectiveEnd = $salesEffectiveEnd;

        $topProducts = TransactionItem::select(
            'product_id',
            'name',
            DB::raw('SUM(qty) as total_sold'),
            DB::raw('SUM(subtotal) as total_revenue')
        )
            ->whereHas('transaction', function ($q) use ($storeId, $startOfMonth, $effectiveEnd) {
                $q->forStore($storeId)->completed()->whereBetween('transacted_at', [$startOfMonth, $effectiveEnd]);
            })
            ->whereNotNull('product_id')
            ->groupBy('product_id', 'name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $lowStockProducts = Product::forStore($storeId)
            ->where('stock_type', 'limited')
            ->where('is_active', true)
            ->whereColumn('stock', '<=', 'minimum_stock')
            ->where('stock', '>', 0)
            ->orderBy('stock', 'asc')
            ->limit(10)
            ->get(['id', 'name', 'stock', 'unit', 'minimum_stock']);

        $recentTransactions = Transaction::forStore($storeId)
            ->completed()
            ->with(['items' => fn($q) => $q->limit(3)])
            ->latest('transacted_at')
            ->limit(10)
            ->get();

        $expenseByType = Expense::forStore($storeId)
            ->whereBetween('expensed_at', [$startOfMonth, $effectiveEnd])
            ->select('type', DB::raw('SUM(amount) as total'))
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                $colors = [
                    'simple' => '#6b7280',
                    'raw_material' => '#3b82f6',
                    'salary' => '#22c55e',
                    'owner_withdrawal' => '#ef4444',
                ];
                $labels = [
                    'simple' => 'Simple',
                    'raw_material' => 'Bahan Baku',
                    'salary' => 'Gaji',
                    'owner_withdrawal' => 'Penarikan Owner',
                ];
                return [
                    'name' => $labels[$item->type] ?? $item->type,
                    'total' => (float) $item->total,
                    'color' => $colors[$item->type] ?? '#6b7280',
                ];
            });

        $productStats = [
            'total_active' => Product::forStore($storeId)->where('is_active', true)->count(),
            'total_inactive' => Product::forStore($storeId)->where('is_active', false)->count(),
            'total_low_stock' => $lowStockProducts->count(),
        ];

        $cashBalance = Store::computeCashBalance($storeId);
        $walletBalance = OwnerWalletTransaction::balanceForStore($storeId);
        $availableMonths = $this->getAvailableMonths($storeId);
        $monthlyRevenueChart = $this->buildMonthlyRevenueChart($storeId);

        $monthData = $this->getPeriodData($storeId, $startOfMonth, $effectiveEnd);
        $netProfitMonth = $monthData['net_profit'];
        $averageMargin = $monthData['total_revenue'] > 0
            ? round(($netProfitMonth / $monthData['total_revenue']) * 100, 1)
            : 0;

        $customerStats = ['total' => $this->getCustomerCount($storeId, $startDate, $endDate)];

        $activeComparisonData = $comparisons[$comparisonKey] ?? $comparisons['last_7_days'];

        return Inertia::render('owner/dashboard/page', [
            'store' => auth()->user()->store,

            'stats' => [
                'total_revenue' => (float) $currentData['total_revenue'],
                'net_profit' => (float) $currentData['net_profit'],
                'products_sold' => (int) $currentData['products_sold'],
                'avg_transaction' => (float) $avgTransaction,
                'transactions' => $periodTransactions,

                'cash_balance' => (float) $cashBalance,
                'wallet_balance' => (float) $walletBalance,
                'monthly_expense' => (float) $monthData['expense'],
                'total_withdrawal' => (float) $monthData['withdrawal'],
                'average_margin' => $averageMargin,
                'net_profit_month' => (float) $netProfitMonth,

                'comparison_revenue' => (float) ($activeComparisonData['revenue'] ?? 0),
                'comparison_net_profit' => (float) ($activeComparisonData['net_profit'] ?? 0),
                'comparison_products_sold' => (int) ($activeComparisonData['products_sold'] ?? 0),
                'comparison_avg_transaction' => (float) ($activeComparisonData['avg_transaction'] ?? 0),
                'comparison_label' => $activeComparisonData['label'] ?? '7 Hari Lalu',
                'revenue_trend' => $activeComparisonData['trends']['revenue'] ?? null,
                'net_profit_trend' => $activeComparisonData['trends']['net_profit'] ?? null,
                'products_sold_trend' => $activeComparisonData['trends']['products_sold'] ?? null,
                'avg_transaction_trend' => $activeComparisonData['trends']['avg_transaction'] ?? null,
            ],

            'period_label' => $periodLabel,
            'customer_stats' => $customerStats,
            'sales_chart' => $salesChart,
            'daily_product_data' => $dailyProductData,
            'customer_transaction_data' => $customerTransactionData,
            'top_products' => $topProducts,
            'low_stock_products' => $lowStockProducts,
            'recent_transactions' => $recentTransactions,
            'expense_by_type' => $expenseByType,
            'product_stats' => $productStats,
            'sales_month' => $salesMonth,
            'product_month' => $productMonth,
            'customer_month' => $customerMonth,
            'available_months' => $availableMonths,
            'monthly_revenue_chart' => $monthlyRevenueChart,
        ]);
    }

    private function getCustomerCount($storeId, $startDate, $endDate)
    {
        return Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');
    }

    private function buildComparisonsFromRange(
        int $storeId,
        Carbon $startDate,
        Carbon $endDate,
        array $currentData,
        float $avgTransaction
    ): array {
        $yesterdayStart = $startDate->copy()->subDays(1);
        $yesterdayEnd = $endDate->copy()->subDays(1);
        $yesterdayData = $this->getPeriodData($storeId, $yesterdayStart, $yesterdayEnd);
        $yesterdayAvg = $yesterdayData['transaction_count'] > 0
            ? $yesterdayData['total_revenue'] / $yesterdayData['transaction_count']
            : 0;

        $last7Start = $startDate->copy()->subDays(7);
        $last7End = $endDate->copy()->subDays(7);
        $last7Data = $this->getPeriodData($storeId, $last7Start, $last7End);
        $last7Avg = $last7Data['transaction_count'] > 0
            ? $last7Data['total_revenue'] / $last7Data['transaction_count']
            : 0;

        $last30Start = $startDate->copy()->subDays(30);
        $last30End = $endDate->copy()->subDays(30);
        $last30Data = $this->getPeriodData($storeId, $last30Start, $last30End);
        $last30Avg = $last30Data['transaction_count'] > 0
            ? $last30Data['total_revenue'] / $last30Data['transaction_count']
            : 0;

        $lastYearStart = $startDate->copy()->subYear();
        $lastYearEnd = $endDate->copy()->subYear();
        $lastYearData = $this->getPeriodData($storeId, $lastYearStart, $lastYearEnd);
        $lastYearAvg = $lastYearData['transaction_count'] > 0
            ? $lastYearData['total_revenue'] / $lastYearData['transaction_count']
            : 0;

        $make = fn($data, $avg, $label) => [
            'label' => $label,
            'revenue' => $data['total_revenue'],
            'net_profit' => $data['net_profit'],
            'products_sold' => $data['products_sold'],
            'avg_transaction' => (float) $avg,
            'trends' => [
                'revenue' => $this->calcTrend($currentData['total_revenue'], $data['total_revenue']),
                'net_profit' => $this->calcTrend($currentData['net_profit'], $data['net_profit']),
                'products_sold' => $this->calcTrend($currentData['products_sold'], $data['products_sold']),
                'avg_transaction' => $this->calcTrend($avgTransaction, $avg),
            ],
        ];

        return [
            'yesterday' => $make($yesterdayData, $yesterdayAvg, 'Kemarin'),
            'last_7_days' => $make($last7Data, $last7Avg, '7 Hari Lalu'),
            'last_30_days' => $make($last30Data, $last30Avg, '30 Hari Lalu'),
            'last_year' => $make($lastYearData, $lastYearAvg, '1 Tahun Lalu'),
        ];
    }

    private function getEffectiveEnd(Carbon $date): Carbon
    {
        $isCurrentMonth = $date->isSameMonth(now());
        return $isCurrentMonth
            ? now()->endOfDay()
            : $date->copy()->endOfMonth()->endOfDay();
    }

    private function getPeriodData($storeId, $startDate, $endDate): array
    {
        $totalRevenue = Transaction::forStore($storeId)->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])->sum('total');

        $hpp = TransactionItem::whereHas('transaction', function ($q) use ($storeId, $startDate, $endDate) {
            $q->forStore($storeId)->completed()->whereBetween('transacted_at', [$startDate, $endDate]);
        })->sum(DB::raw('capital_price * qty'));

        $expenses = Expense::forStore($storeId)->whereBetween('expensed_at', [$startDate, $endDate])->get();
        $expenseTotal = $expenses->where('type', '!=', 'store_transfer_in')->sum(fn($e) => $e->total_amount);
        $withdrawalTotal = $expenses->where('type', 'owner_withdrawal')->sum(fn($e) => $e->total_amount);

        $productsSold = TransactionItem::whereHas('transaction', function ($q) use ($storeId, $startDate, $endDate) {
            $q->forStore($storeId)->completed()->whereBetween('transacted_at', [$startDate, $endDate]);
        })->sum('qty');

        $transactionCount = Transaction::forStore($storeId)->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])->count();

        return [
            'total_revenue' => (float) $totalRevenue,
            'hpp' => (float) $hpp,
            'expense' => (float) $expenseTotal,
            'withdrawal' => (float) $withdrawalTotal,
            'net_profit' => (float) ($totalRevenue - $hpp),
            'products_sold' => (int) $productsSold,
            'transaction_count' => (int) $transactionCount,
        ];
    }

    private function calcTrend(float $current, float $previous): ?int
    {
        if ($previous <= 0) {
            return null;
        }
        $result = (int) round((($current - $previous) / $previous) * 100);
        return $result === 0 ? 0 : $result;
    }

    private function buildDailyChart($storeId, Carbon $date, Carbon $effectiveEnd): array
    {
        $startDate = $date->copy()->startOfMonth()->startOfDay();
        $isCurrentMonth = $date->isSameMonth(now());
        $lastDay = $isCurrentMonth ? now()->day : $date->daysInMonth;

        $rows = Transaction::forStore($storeId)->completed()
            ->whereBetween('transacted_at', [$startDate, $effectiveEnd])
            ->selectRaw('DAY(transacted_at) as day, payment_method, SUM(total) as revenue')
            ->groupBy('day', 'payment_method')
            ->orderBy('day')
            ->get();

        $byDay = [];
        foreach ($rows as $row) {
            $byDay[(int) $row->day][$row->payment_method] = (float) $row->revenue;
        }

        $channels = ['cash', 'qris'];
        $chart = [];
        for ($day = 1; $day <= $lastDay; $day++) {
            $entry = ['date' => (string) $day];
            $total = 0;
            foreach ($channels as $ch) {
                $val = $byDay[$day][$ch] ?? 0;
                $entry[$ch] = $val;
                $total += $val;
            }
            $entry['revenue'] = $total;
            $chart[] = $entry;
        }
        return $chart;
    }

    private function buildDailyProductChart($storeId, Carbon $date, Carbon $effectiveEnd): array
    {
        $startDate = $date->copy()->startOfMonth()->startOfDay();
        $isCurrentMonth = $date->isSameMonth(now());
        $lastDay = $isCurrentMonth ? now()->day : $date->daysInMonth;

        $rows = TransactionItem::whereHas('transaction', function ($q) use ($storeId, $startDate, $effectiveEnd) {
            $q->forStore($storeId)->completed()->whereBetween('transacted_at', [$startDate, $effectiveEnd]);
        })
            ->selectRaw('DAY(transactions.transacted_at) as day, SUM(transaction_items.qty) as total_quantity, SUM(transaction_items.subtotal) as total_revenue')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $chart = [];
        for ($day = 1; $day <= $lastDay; $day++) {
            $row = $rows->firstWhere('day', $day);
            $chart[] = [
                'date' => (string) $day,
                'total_quantity' => (int) ($row->total_quantity ?? 0),
                'total_revenue' => (float) ($row->total_revenue ?? 0),
            ];
        }
        return $chart;
    }

    private function buildCustomerTransactionChart($storeId, Carbon $date, Carbon $effectiveEnd): array
    {
        $startDate = $date->copy()->startOfMonth()->startOfDay();
        $isCurrentMonth = $date->isSameMonth(now());
        $lastDay = $isCurrentMonth ? now()->day : $date->daysInMonth;

        $rows = Transaction::forStore($storeId)->completed()
            ->whereBetween('transacted_at', [$startDate, $effectiveEnd])
            ->selectRaw('DAY(transacted_at) as day, COUNT(*) as transactions, COUNT(DISTINCT customer_id) as unique_customers')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $chart = [];
        for ($day = 1; $day <= $lastDay; $day++) {
            $row = $rows->firstWhere('day', $day);
            $chart[] = [
                'date' => (string) $day,
                'transactions' => (int) ($row->transactions ?? 0),
                'unique_customers' => (int) ($row->unique_customers ?? 0),
            ];
        }
        return $chart;
    }

    private function buildMonthlyRevenueChart(int $storeId): array
    {
        $rows = Transaction::forStore($storeId)->completed()
            ->where('total', '>', 0)
            ->selectRaw("YEAR(transacted_at) as year, MONTH(transacted_at) as month, SUM(total) as revenue, COUNT(*) as transactions")
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        $profitRows = TransactionItem::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.store_id', $storeId)
            ->where('transactions.status', 'completed')
            ->where('transactions.total', '>', 0)
            ->selectRaw("YEAR(transactions.transacted_at) as year, MONTH(transactions.transacted_at) as month, SUM(transaction_items.capital_price * transaction_items.qty) as hpp")
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn($r) => $r->year . '-' . $r->month);

        return $rows->map(function ($row) use ($profitRows) {
            $key = $row->year . '-' . $row->month;
            $hpp = (float) ($profitRows[$key]->hpp ?? 0);
            return [
                'year' => (int) $row->year,
                'month' => (int) $row->month,
                'revenue' => (float) $row->revenue,
                'net_profit' => (float) $row->revenue - $hpp,
                'transactions' => (int) $row->transactions,
            ];
        })->values()->toArray();
    }

    private function getAvailableMonths($storeId): array
    {
        $months = Transaction::forStore($storeId)->completed()
            ->where('total', '>', 0)->where('transacted_at', '<=', now())
            ->selectRaw("DISTINCT DATE_FORMAT(transacted_at, '%Y-%m') as month_value")
            ->orderBy('month_value', 'desc')->get();

        if ($months->isEmpty()) {
            $result = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $result[] = ['value' => $date->format('Y-m'), 'label' => $date->isoFormat('MMMM YYYY')];
            }
            return $result;
        }

        return $months->map(function ($m) {
            $date = Carbon::parse($m->month_value . '-01');
            return ['value' => $date->format('Y-m'), 'label' => $date->isoFormat('MMMM YYYY')];
        })->unique('value')->values()->toArray();
    }
}