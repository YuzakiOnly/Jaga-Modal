<?php

namespace App\Helpers\Languages;

class Languages
{
    public static function getAll(): array
    {
        return [
            ...AuthLanguages::getAll(),
        ];
    }

    public static function getCategory(string $category): array
    {
        return match($category) {
            'auth' => AuthLanguages::getAll(),
            default => [],
        };
    }
}