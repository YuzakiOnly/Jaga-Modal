<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Session;
use App\Helpers\Languages\Languages;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $locale = Session::get('locale', 'id');

        return [
            ...parent::share($request),

            'auth' => [
                'user' => $request->user()
                    ? $request->user()->load('store:id,name,slug,business_type,logo')
                    : null,
            ],

            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
                'inviteToken' => session('inviteToken'),
            ],

            'locale' => $locale,

            'available_locales' => config('app.available_locales', ['id', 'en']),

            'translations' => Languages::getAll(),
        ];
    }
}