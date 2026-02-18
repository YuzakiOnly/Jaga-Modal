<?php

namespace App\Helpers\Languages;

use Illuminate\Support\Facades\App;

class Languages
{
    public static function getAll(): array
    {
        $locale = App::getLocale();

        return [
            'auth' => AuthLanguages::getAll(),
        ];
    }

    public static function getCategory(string $category): array
    {
        $categoryMap = [
            'auth' => AuthLanguages::class,
        ];

        if (isset($categoryMap[$category])) {
            $class = $categoryMap[$category];
            return $class::getAll();
        }

        // Fallback ke file JSON jika ada
        $locale = App::getLocale();
        $path = resource_path("lang/{$locale}/{$category}.php");

        if (file_exists($path)) {
            return require $path;
        }

        return [];
    }
}