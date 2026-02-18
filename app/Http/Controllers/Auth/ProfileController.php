<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();

        $canEditEmail = in_array($user->role, ['super_admin', 'owner', 'admin']);

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:20', 'regex:/^[a-z0-9_]+$/', 'unique:users,username,' . $user->id],
            'phone' => ['required', 'string', 'max:30'],
        ];

        if ($canEditEmail) {
            $rules['email'] = ['required', 'email', 'max:255', 'unique:users,email,' . $user->id];
        }

        $messages = [
            'username.regex' => 'Username hanya boleh huruf kecil, angka, dan underscore.',
        ];

        $request->validate($rules, $messages);

        $user->name = $request->name;
        $user->username = $request->username;
        $user->phone = $request->phone;
        if ($canEditEmail && $request->has('email')) {
            $user->email = $request->email;
        }

        $user->save();

        return back()->with('success', 'Profil berhasil diperbarui');
    }
}