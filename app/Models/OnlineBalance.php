<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OnlineBalance extends Model
{
    protected $table = 'online_balances';

    protected $fillable = [
        'store_id',
        'total_balance',
        'channel_breakdown',
    ];

    protected $casts = [
        'total_balance' => 'decimal:2',
        'channel_breakdown' => 'array',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public static function getBalance(int $storeId): float
    {
        $balance = self::where('store_id', $storeId)->first();
        return $balance ? (float) $balance->total_balance : 0;
    }

    public static function getChannelBreakdown(int $storeId): array
    {
        $balance = self::where('store_id', $storeId)->first();
        if (!$balance || !$balance->channel_breakdown) {
            return [
                'grabfood' => 0,
                'shopeefood' => 0,
                'gobiz' => 0,
            ];
        }
        return $balance->channel_breakdown;
    }

    public static function addRevenue(int $storeId, string $channel, float $netRevenue): void
    {
        if ($netRevenue <= 0)
            return;

        $balance = self::firstOrCreate(
            ['store_id' => $storeId],
            [
                'total_balance' => 0,
                'channel_breakdown' => ['grabfood' => 0, 'shopeefood' => 0, 'gobiz' => 0],
            ]
        );

        $breakdown = $balance->channel_breakdown ?? ['grabfood' => 0, 'shopeefood' => 0, 'gobiz' => 0];

        if (isset($breakdown[$channel])) {
            $breakdown[$channel] = ($breakdown[$channel] ?? 0) + $netRevenue;
        } else {
            $breakdown[$channel] = $netRevenue;
        }

        $balance->update([
            'total_balance' => ($balance->total_balance ?? 0) + $netRevenue,
            'channel_breakdown' => $breakdown,
        ]);
    }

    public static function deductBalance(int $storeId, float $amount): bool
    {
        $balance = self::where('store_id', $storeId)->first();

        if (!$balance || ($balance->total_balance ?? 0) < $amount) {
            return false;
        }

        $breakdown = $balance->channel_breakdown ?? ['grabfood' => 0, 'shopeefood' => 0, 'gobiz' => 0];
        $total = $balance->total_balance;

        if ($total > 0) {
            $remainingAmount = $amount;
            foreach ($breakdown as $channel => $value) {
                if ($remainingAmount <= 0)
                    break;
                $proportion = $value / $total;
                $deduction = min($value, $amount * $proportion);
                $breakdown[$channel] = max(0, $value - $deduction);
                $remainingAmount -= $deduction;
            }

            if ($remainingAmount > 0) {
                foreach ($breakdown as $channel => $value) {
                    if ($remainingAmount <= 0)
                        break;
                    $deduction = min($value, $remainingAmount);
                    $breakdown[$channel] = max(0, $value - $deduction);
                    $remainingAmount -= $deduction;
                }
            }
        }

        $balance->update([
            'total_balance' => ($balance->total_balance ?? 0) - $amount,
            'channel_breakdown' => $breakdown,
        ]);

        return true;
    }

    public static function syncFromTransactions(int $storeId): void
    {
        $netRevenueByChannel = Transaction::forStore($storeId)
            ->completed()
            ->whereIn('order_channel', Transaction::ONLINE_CHANNELS)
            ->select('order_channel', \Illuminate\Support\Facades\DB::raw('SUM(net_revenue) as total'))
            ->groupBy('order_channel')
            ->get()
            ->pluck('total', 'order_channel')
            ->toArray();

        $totalBalance = array_sum($netRevenueByChannel);

        $expenses = Expense::forStore($storeId)
            ->where('payment_source', 'online')
            ->sum('amount');

        $totalBalance = $totalBalance - $expenses;

        self::updateOrCreate(
            ['store_id' => $storeId],
            [
                'total_balance' => max(0, $totalBalance),
                'channel_breakdown' => $netRevenueByChannel,
            ]
        );
    }
}