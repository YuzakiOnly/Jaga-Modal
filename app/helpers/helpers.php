<?php

use App\Helpers\Languages\Languages;

if (!function_exists('languages')) {
    function languages($category = null)
    {
        if ($category) {
            return Languages::getCategory($category);
        }

        return Languages::getAll();
    }
}