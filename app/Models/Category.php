<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'sort_order',
        'store_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Category $category) {
            if (auth()->check() && !$category->store_id) {
                $category->store_id = auth()->user()->store_id;
            }

            if (!$category->store_id) {
                throw new \RuntimeException('Store ID is required to generate a unique slug.');
            }

            if (empty($category->slug)) {
                $category->slug = static::generateUniqueSlug(
                    $category->name,
                    $category->store_id
                );
            }
        });

        static::updating(function (Category $category) {
            if ($category->isDirty('name') && !$category->isDirty('slug')) {
                if (!$category->store_id) {
                    throw new \RuntimeException('Store ID is required to generate a unique slug.');
                }
                $category->slug = static::generateUniqueSlug(
                    $category->name,
                    $category->store_id,
                    $category->id
                );
            }
        });
    }

    protected static function generateUniqueSlug(string $name, int $storeId, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $count = 1;
        $base = $slug;

        while (
            static::withTrashed()
                ->where('slug', $slug)
                ->where('store_id', $storeId)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$count}";
            $count++;
        }

        return $slug;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    public function scopeForStore($query, $storeId = null)
    {
        $storeId = $storeId ?? auth()->user()?->store_id;
        return $query->where('store_id', $storeId);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}