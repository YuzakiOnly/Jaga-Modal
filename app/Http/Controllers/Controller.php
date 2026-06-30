<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

abstract class Controller
{
    protected function slug(): ?string
    {
        $user = Auth::user();

        if (!$user) {
            return null;
        }

        return $user->store?->slug;
    }
}