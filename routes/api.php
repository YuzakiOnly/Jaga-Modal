<?php

use App\Http\Controllers\Api\InviteCodeController;
use Illuminate\Support\Facades\Route;

Route::get('/whatsapp-link', [InviteCodeController::class, 'getWhatsAppLink']);