<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Expense;
use App\Models\Product;
use App\Models\OwnerWalletTransaction;
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

        $selectedMonth = $request->input('month', now()->format('Y-m'));
        $selectedDate = Carbon::parse($selectedMonth . '-01');

        $startOfMonth = $selectedDate->copy()->startOfMonth()->startOfDay();
        $endOfMonth = $selectedDate->copy()->endOfMonth()->endOfDay();

        $isCurrentMonth = $selectedDate->isSameMonth(now());
        $effectiveEnd = $isCurrentMonth ? now()->endOfDay() : $endOfMonth;

        $currentData = $this->getPeriodData($storeId, $startOfMonth, $effectiveEnd);

        $comparisonPeriod = $request->input('comparison', 'last_month');
        $comparisonData = $this->getComparisonData($storeId, $comparisonPeriod, $selectedDate, $startOfMonth, $effectiveEnd);

        $monthlyTransactions = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startOfMonth, $effectiveEnd])
            ->count();

        $avgTransaction = $monthlyTransactions > 0 ? $currentData['net_revenue'] / $monthlyTransactions : 0;

        $comparisonAvgTransaction = null;
        if ($comparisonData['transaction_count'] > 0) {
            $comparisonAvgTransaction = $comparisonData['net_revenue'] / $comparisonData['transaction_count'];
        }

        $todayRevenue = Transaction::forStore($storeId)
            ->completed()
            ->whereDate('transacted_at', today())
            ->sum('net_revenue');

        $todayTransactions = Transaction::forStore($storeId)
            ->completed()
            ->whereDate('transacted_at', today())
            ->count();

        $salesChart = $this->buildDailyChart($storeId, $selectedDate, $effectiveEnd);

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

        $totalStoreCashRevenue = Transaction::forStore($storeId)
            ->completed()
            ->storeCashOnly()
            ->sum('net_revenue');

        $cashExpenses = Expense::forStore($storeId)
            ->where('payment_source', 'cash')
            ->sum('amount');

        $totalExpenseAll = Expense::forStore($storeId)->get()->sum(fn($e) => $e->total_amount);
        $cashBalance = $totalStoreCashRevenue - $totalExpenseAll;

        $onlineChannelBalances = collect(Transaction::ONLINE_CHANNELS)
            ->mapWithKeys(function ($channel) use ($storeId, $startOfMonth, $effectiveEnd) {
                $netRevenue = Transaction::forStore($storeId)
                    ->completed()
                    ->forChannel($channel)
                    ->whereBetween('transacted_at', [$startOfMonth, $effectiveEnd])
                    ->sum('net_revenue');
                $platformFee = Transaction::forStore($storeId)
                    ->completed()
                    ->forChannel($channel)
                    ->whereBetween('transacted_at', [$startOfMonth, $effectiveEnd])
                    ->sum('platform_fee');
                return [
                    $channel => [
                        'net_revenue' => (float) $netRevenue,
                        'platform_fee' => (float) $platformFee,
                    ]
                ];
            });

        $walletBalance = OwnerWalletTransaction::balanceForStore($storeId);

        $availableMonths = $this->getAvailableMonths($storeId);

        return Inertia::render('owner/dashboard/page', [
            'store' => auth()->user()->store,
            'stats' => [
                'monthly_revenue' => (float) $currentData['gross_revenue'],
                'monthly_net_revenue' => (float) $currentData['net_revenue'],
                'total_hpp' => (float) $currentData['hpp'],
                'total_platform_fee' => (float) $currentData['platform_fee'],
                'monthly_expense' => (float) $currentData['expense'],
                'total_withdrawal' => (float) $currentData['withdrawal'],
                'gross_profit' => (float) $currentData['gross_profit'],
                'net_profit' => (float) $currentData['net_profit'],
                'monthly_transactions' => $monthlyTransactions,
                'total_products_sold' => (int) $currentData['products_sold'],
                'avg_transaction' => (float) $avgTransaction,
                'average_margin' => $currentData['net_revenue'] > 0
                    ? round(($currentData['net_profit'] / $currentData['net_revenue']) * 100, 1)
                    : 0,
                'today_revenue' => (float) $todayRevenue,
                'today_transactions' => $todayTransactions,
                'revenue_trend' => 0,
                'cash_balance' => (float) $cashBalance,
                'wallet_balance' => (float) $walletBalance,
                'online_channel_balances' => $onlineChannelBalances,
            ],
            'comparison_data' => [
                'revenue' => $comparisonData['net_revenue'],
                'net_profit' => $comparisonData['net_profit'],
                'products_sold' => $comparisonData['products_sold'],
                'avg_transaction' => $comparisonAvgTransaction !== null ? (float) $comparisonAvgTransaction : 0,
                'transaction_count' => $comparisonData['transaction_count'],
                'label' => $comparisonData['label'],
                'period' => $comparisonPeriod,
            ],
            'sales_chart' => $salesChart,
            'top_products' => $topProducts,
            'low_stock_products' => $lowStockProducts,
            'recent_transactions' => $recentTransactions,
            'expense_by_type' => $expenseByType,
            'product_stats' => $productStats,
            'selected_month' => $selectedMonth,
            'available_months' => $availableMonths,
            'online_channels' => Transaction::ONLINE_CHANNELS,
        ]);
    }

    private function getPeriodData($storeId, $startDate, $endDate): array
    {
        $grossRevenue = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])
            ->sum('total');

        $netRevenue = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])
            ->sum('net_revenue');

        $platformFee = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])
            ->sum('platform_fee');

        $hpp = TransactionItem::whereHas('transaction', function ($q) use ($storeId, $startDate, $endDate) {
            $q->forStore($storeId)->completed()->whereBetween('transacted_at', [$startDate, $endDate]);
        })->sum(DB::raw('capital_price * qty'));

        $expenses = Expense::forStore($storeId)
            ->whereBetween('expensed_at', [$startDate, $endDate])
            ->get();

        $expenseTotal = $expenses->sum(fn($e) => $e->total_amount);
        $withdrawalTotal = $expenses->where('type', 'owner_withdrawal')->sum(fn($e) => $e->total_amount);

        $productsSold = TransactionItem::whereHas('transaction', function ($q) use ($storeId, $startDate, $endDate) {
            $q->forStore($storeId)->completed()->whereBetween('transacted_at', [$startDate, $endDate]);
        })->sum('qty');

        $transactionCount = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startDate, $endDate])
            ->count();

        return [
            'gross_revenue' => (float) $grossRevenue,
            'net_revenue' => (float) $netRevenue,
            'platform_fee' => (float) $platformFee,
            'hpp' => (float) $hpp,
            'expense' => (float) $expenseTotal,
            'withdrawal' => (float) $withdrawalTotal,
            'gross_profit' => (float) ($netRevenue - $hpp),
            'net_profit' => (float) ($netRevenue - $hpp - $expenseTotal),
            'products_sold' => (int) $productsSold,
            'transaction_count' => (int) $transactionCount,
        ];
    }

    private function getComparisonData($storeId, string $comparisonPeriod, Carbon $selectedDate, $currentStartDate, $currentEndDate): array
    {
        $now = Carbon::now();
        $today = $now->copy()->startOfDay();

        switch ($comparisonPeriod) {
            case 'yesterday':
                $startDate = $today->copy()->subDay();
                $endDate = $today->copy()->subDay()->endOfDay();
                $label = 'Kemarin';
                break;
            case 'last_week':
                $startDate = $today->copy()->subWeek();
                $endDate = $today->copy()->subDay()->endOfDay();
                $label = '1 Minggu Lalu';
                break;
            case 'last_month':
            default:
                $startDate = $selectedDate->copy()->subMonth()->startOfMonth();
                $endDate = $selectedDate->copy()->subMonth()->endOfMonth();
                $label = 'Bulan Lalu';
        }

        return array_merge($this->getPeriodData($storeId, $startDate, $endDate), [
            'label' => $label,
            'period' => $comparisonPeriod,
        ]);
    }

    private function buildDailyChart($storeId, Carbon $date, Carbon $effectiveEnd): array
    {
        $startDate = $date->copy()->startOfMonth()->startOfDay();
        $daysInMonth = $date->daysInMonth;
        $today = now()->day;
        $isCurrentMonth = $date->isSameMonth(now());
        $lastDay = $isCurrentMonth ? $today : $daysInMonth;

        $rows = Transaction::forStore($storeId)
            ->completed()
            ->whereBetween('transacted_at', [$startDate, $effectiveEnd])
            ->selectRaw('DAY(transacted_at) as day, SUM(net_revenue) as revenue, COUNT(*) as count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        $chart = [];
        for ($day = 1; $day <= $lastDay; $day++) {
            $row = $rows->get($day);
            $chart[] = [
                'date' => (string) $day,
                'revenue' => (float) ($row->revenue ?? 0),
                'count' => (int) ($row->count ?? 0),
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
            ->selectRaw("DISTINCT DATE_FORMAT(transacted_at, '%Y-%m') as month_value")
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