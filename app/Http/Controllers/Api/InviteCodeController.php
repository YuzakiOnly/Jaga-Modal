<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InviteCode;
use Illuminate\Http\Request;

class InviteCodeController extends Controller
{
    public function getWhatsAppLink()
    {
        $waNumber = config('app.invite_wa_number');

        $code = InviteCode::where('is_used', false)
            ->inRandomOrder()
            ->first();

        if ($code) {
            $waMessage = "Halo! Saya ingin mendaftar di JagaModal.\n\n";
            $waMessage .= "Kode invite saya: {$code->code}\n";
            $waMessage .= "Nama: (isi nama Anda)\n";
            $waMessage .= "Email: (isi email Anda)\n";
            $waMessage .= "Nomor HP: (isi nomor HP Anda)";
        } else {
            $waMessage = config('app.invite_wa_message', 'Halo! Saya ingin mendaftar dan meminta kode invite.');
        }

        $waLink = $waNumber
            ? 'https://wa.me/' . $waNumber . '?text=' . rawurlencode($waMessage)
            : null;

        return response()->json([
            'success' => true,
            'wa_link' => $waLink,
            'invite_code' => $code ? $code->code : null
        ]);
    }
}