<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store) {
            return back()->withErrors(['store' => 'Store tidak ditemukan.']);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'business_type' => ['required', 'string', 'max:100'],
            'country' => ['required', 'string', 'max:10'],
            'province' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'logo' => ['nullable', 'image', 'max:2048'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
        ]);

        $data = $request->only(['name', 'business_type', 'country', 'province', 'address', 'latitude', 'longitude']);

        if ($request->hasFile('logo')) {
            if ($store->logo) {
                $oldPath = str_replace('/storage/', '', $store->logo);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $file = $request->file('logo');
            $extension = $file->getClientOriginalExtension();
            $hashName = Str::random(40) . '.' . $extension;
            $path = $file->storeAs('logos', $hashName, 'public');

            $data['logo'] = '/storage/' . $path;

            if (!$request->hasFile('thumbnail')) {
                $data['thumbnail'] = '/storage/' . $path;
            }
        }
        if ($request->hasFile('thumbnail')) {
            if ($store->thumbnail) {
                $oldPath = str_replace('/storage/', '', $store->thumbnail);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $file = $request->file('thumbnail');
            $extension = $file->getClientOriginalExtension();
            $hashName = Str::random(40) . '.' . $extension;
            $path = $file->storeAs('thumbnails', $hashName, 'public');

            $data['thumbnail'] = '/storage/' . $path;
        }

        $store->update($data);

        return back()->with('success', 'Informasi toko berhasil diperbarui.');
    }
}