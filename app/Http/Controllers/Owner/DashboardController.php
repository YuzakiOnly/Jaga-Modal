<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Expense;
use App\Models\OnlineBalance;
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

        $period = $request->input('period', 'hari_ini');

        $salesMonth = $request->input('sales_month', now()->format('Y-m'));
        $productMonth = $request->input('product_month', now()->format('Y-m'));
        $customerMonth = $request->input('customer_month', now()->format('Y-m'));

        $salesDate = Carbon::parse($salesMonth . '-01');
        $productDate = Carbon::parse($productMonth . '-01');
        $customerDate = Carbon::parse($customerMonth . '-01');

        $selectedDate = $salesDate;

        [$periodStart, $periodEnd, $periodLabel] = $this->getPeriodRange($period, $selectedDate);

        $currentData = $this->getPeriodData($storeId, $periodStart, $periodEnd);

        $periodTransactions = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$periodStart, $periodEnd])
            ->count();

        $avgTransaction = $periodTransactions > 0
            ? $currentData['net_revenue'] / $periodTransactions
            : 0;

        $comparisons = $this->buildComparisons(
            $storeId,
            $period,
            $selectedDate,
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

        // Saldo Kas Toko (semua channel)
        $cashBalance = Store::computeCashBalance($storeId);

        // Saldo Dine In (hanya dari transaksi dine_in, TANPA transfer)
        $dineInBalance = Store::getDineInBalance($storeId);

        // Saldo Online per channel
        $onlineBalances = OnlineBalance::getAllChannelBalances($storeId);
        $onlineBalanceTotal = OnlineBalance::getBalance($storeId);

        $onlineChannelBalances = [];
        foreach ($onlineBalances as $channel => $balance) {
            $onlineChannelBalances[$channel] = ['net_revenue' => (float) $balance];
        }

        $onlineChannelPeriod = collect(Transaction::ONLINE_CHANNELS)
            ->mapWithKeys(function ($channel) use ($storeId, $periodStart, $periodEnd) {
                $netRevenue = Transaction::forStore($storeId)->completed()->forChannel($channel)
                    ->whereBetween('transacted_at', [$periodStart, $periodEnd])->sum('net_revenue');
                return [$channel => (float) $netRevenue];
            })->toArray();

        $walletBalance = OwnerWalletTransaction::balanceForStore($storeId);
        $availableMonths = $this->getAvailableMonths($storeId);
        $monthlyRevenueChart = $this->buildMonthlyRevenueChart($storeId);

        $monthData = $this->getPeriodData($storeId, $startOfMonth, $effectiveEnd);
        $netProfitMonth = $monthData['net_profit'];
        $averageMargin = $monthData['net_revenue'] > 0
            ? round(($netProfitMonth / $monthData['net_revenue']) * 100, 1)
            : 0;

        $customerStats = $this->buildCustomerStats($storeId, $period);

        return Inertia::render('owner/dashboard/page', [
            'store' => auth()->user()->store,

            'stats' => [
                'net_revenue' => (float) $currentData['net_revenue'],
                'net_profit' => (float) $currentData['net_profit'],
                'products_sold' => (int) $currentData['products_sold'],
                'avg_transaction' => (float) $avgTransaction,
                'transactions' => $periodTransactions,

                // Saldo
                'cash_balance' => (float) $cashBalance,
                'dine_in_balance' => (float) $dineInBalance,
                'online_balance_total' => (float) $onlineBalanceTotal,

                // Online per channel
                'online_balance_grabfood' => (float) ($onlineBalances['grabfood'] ?? 0),
                'online_balance_shopeefood' => (float) ($onlineBalances['shopeefood'] ?? 0),
                'online_balance_gobiz' => (float) ($onlineBalances['gobiz'] ?? 0),

                'online_channel_balances' => $onlineChannelBalances,
                'online_channel_period' => $onlineChannelPeriod,

                'wallet_balance' => (float) $walletBalance,
                'monthly_expense' => (float) $monthData['expense'],
                'total_withdrawal' => (float) $monthData['withdrawal'],
                'average_margin' => $averageMargin,
                'net_profit_month' => (float) $netProfitMonth,
                'total_platform_fee' => (float) $currentData['platform_fee'],
                'gross_revenue' => (float) $currentData['gross_revenue'],
            ],

            'comparisons' => $comparisons,
            'period' => $period,
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
            'online_channels' => Transaction::ONLINE_CHANNELS,
        ]);
    }

    // ... sisanya sama seperti kode Anda sebelumnya
    private function getEffectiveEnd(Carbon $date): Carbon
    {
        $isCurrentMonth = $date->isSameMonth(now());
        return $isCurrentMonth
            ? now()->endOfDay()
            : $date->copy()->endOfMonth()->endOfDay();
    }

    private function buildCustomerStats(int $storeId, string $period): array
    {
        $ranges = [
            'hari_ini' => [today()->startOfDay(), today()->endOfDay()],
            'minggu_ini' => [now()->startOfWeek()->startOfDay(), now()->endOfDay()],
            'bulan_ini' => [now()->startOfMonth()->startOfDay(), now()->endOfDay()],
        ];

        $result = [];
        foreach ($ranges as $key => [$start, $end]) {
            $total = Transaction::forStore($storeId)
                ->completed()
                ->whereBetween('transacted_at', [$start, $end])
                ->whereNotNull('customer_id')
                ->distinct('customer_id')
                ->count('customer_id');

            $result[$key] = ['total' => $total];
        }

        return $result;
    }

    private function getPeriodRange(string $period, Carbon $selectedDate): array
    {
        switch ($period) {
            case 'hari_ini':
                return [today()->startOfDay(), today()->endOfDay(), 'Hari Ini'];
            case 'minggu_ini':
                return [now()->startOfWeek()->startOfDay(), now()->endOfDay(), 'Minggu Ini'];
            case 'bulan_ini':
            default:
                $isCurrentMonth = $selectedDate->isSameMonth(now());
                return [
                    $selectedDate->copy()->startOfMonth()->startOfDay(),
                    $isCurrentMonth ? now()->endOfDay() : $selectedDate->copy()->endOfMonth()->endOfDay(),
                    $selectedDate->isoFormat('MMMM YYYY'),
                ];
        }
    }

    private function buildComparisons(
        int $storeId,
        string $period,
        Carbon $selectedDate,
        array $currentData,
        float $avgTransaction
    ): array {
        $yesterday = now()->subDay();
        $yesterdayData = $this->getPeriodData($storeId, $yesterday->copy()->startOfDay(), $yesterday->copy()->endOfDay());
        $yesterdayAvg = $yesterdayData['transaction_count'] > 0
            ? $yesterdayData['net_revenue'] / $yesterdayData['transaction_count'] : 0;

        $lastWeekStart = now()->startOfWeek()->subWeek();
        $lastWeekEnd = now()->startOfWeek()->subSecond();
        $lastWeekData = $this->getPeriodData($storeId, $lastWeekStart, $lastWeekEnd);
        $lastWeekAvg = $lastWeekData['transaction_count'] > 0
            ? $lastWeekData['net_revenue'] / $lastWeekData['transaction_count'] : 0;

        $lastMonthStart = $selectedDate->copy()->subMonth()->startOfMonth()->startOfDay();
        $lastMonthEnd = $selectedDate->copy()->subMonth()->endOfMonth()->endOfDay();
        $lastMonthData = $this->getPeriodData($storeId, $lastMonthStart, $lastMonthEnd);
        $lastMonthAvg = $lastMonthData['transaction_count'] > 0
            ? $lastMonthData['net_revenue'] / $lastMonthData['transaction_count'] : 0;

        $make = fn($data, $avg, $label) => [
            'label' => $label,
            'revenue' => $data['net_revenue'],
            'gross_revenue' => $data['gross_revenue'],
            'platform_fee' => $data['platform_fee'],
            'net_profit' => $data['net_profit'],
            'products_sold' => $data['products_sold'],
            'avg_transaction' => (float) $avg,
            'trends' => [
                'revenue' => $this->calcTrend($currentData['net_revenue'], $data['net_revenue']),
                'net_profit' => $this->calcTrend($currentData['net_profit'], $data['net_profit']),
                'products_sold' => $this->calcTrend($currentData['products_sold'], $data['products_sold']),
                'avg_transaction' => $this->calcTrend($avgTransaction, $avg),
            ],
        ];

        return [
            'yesterday' => $make($yesterdayData, $yesterdayAvg, 'Kemarin'),
            'last_week' => $make($lastWeekData, $lastWeekAvg, 'Minggu Lalu'),
            'last_month' => $make($lastMonthData, $lastMonthAvg, 'Bulan Lalu'),
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

    private function getPeriodData($storeId, $startDate, $endDate): array
    {
        $netRevenue = Transaction::forStore($storeId)->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])->sum('net_revenue');

        $grossRevenue = Transaction::forStore($storeId)->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])->sum('total');

        $platformFee = Transaction::forStore($storeId)->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])->sum('platform_fee');

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
            'gross_revenue' => (float) $grossRevenue,
            'net_revenue' => (float) $netRevenue,
            'platform_fee' => (float) $platformFee,
            'hpp' => (float) $hpp,
            'expense' => (float) $expenseTotal,
            'withdrawal' => (float) $withdrawalTotal,
            'gross_profit' => (float) ($netRevenue - $hpp),
            'net_profit' => (float) ($netRevenue - $hpp),
            'products_sold' => (int) $productsSold,
            'transaction_count' => (int) $transactionCount,
        ];
    }

    private function buildDailyChart($storeId, Carbon $date, Carbon $effectiveEnd): array
    {
        $startDate = $date->copy()->startOfMonth()->startOfDay();
        $isCurrentMonth = $date->isSameMonth(now());
        $lastDay = $isCurrentMonth ? now()->day : $date->daysInMonth;

        $rows = Transaction::forStore($storeId)->completed()
            ->whereBetween('transacted_at', [$startDate, $effectiveEnd])
            ->selectRaw('DAY(transacted_at) as day, payment_method, SUM(net_revenue) as revenue')
            ->groupBy('day', 'payment_method')
            ->orderBy('day')
            ->get();

        $byDay = [];
        foreach ($rows as $row) {
            $byDay[(int) $row->day][$row->payment_method] = (float) $row->revenue;
        }

        $channels = ['cash', 'qris', 'grabfood', 'shopeefood', 'gobiz'];
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
            ->selectRaw("YEAR(transacted_at) as year, MONTH(transacted_at) as month, SUM(net_revenue) as revenue, SUM(total) as gross_revenue, SUM(platform_fee) as platform_fee, COUNT(*) as transactions")
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
                'gross_revenue' => (float) $row->gross_revenue,
                'platform_fee' => (float) $row->platform_fee,
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