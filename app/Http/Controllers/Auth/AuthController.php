<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('auth/Login', [
            'titlePage' => 'Login'
        ]);
    }

    public function showRegister()
    {
        return Inertia::render('auth/Register', [
            'titlePage' => 'Register'
        ]);
    }
}