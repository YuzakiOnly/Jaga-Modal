<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\EmployeeInvitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $owner = Auth::user();
        $storeId = $owner->store_id;

        $search = $request->string('search')->toString();

        $employees = User::where('store_id', $storeId)
            ->where('role', '!=', 'owner')
            ->where('approval_status', 'approved')
            ->when($search, fn($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            }))
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        $pendingApprovals = User::where('store_id', $storeId)
            ->where('role', '!=', 'owner')
            ->where('approval_status', 'pending')
            ->orderByDesc('created_at')
            ->get();

        $pendingInvitations = EmployeeInvitation::where('store_id', $storeId)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('owner/employees/page', [
            'titlePage' => 'Employees',
            'employees' => $employees,
            'pendingApprovals' => $pendingApprovals,
            'pendingInvitations' => $pendingInvitations,
            'filters' => ['search' => $search],
            'employeeCount' => User::activeEmployeeCount($storeId),
            'maxEmployees' => User::MAX_EMPLOYEES_PER_STORE,
        ]);
    }

    public function create()
    {
        $owner = Auth::user();
        $storeId = $owner->store_id;

        return Inertia::render('owner/employees/create/page', [
            'titlePage' => 'Add Employee',
            'employeeCount' => User::activeEmployeeCount($storeId),
            'maxEmployees' => User::MAX_EMPLOYEES_PER_STORE,
        ]);
    }

    public function store(Request $request)
    {
        $owner = Auth::user();
        $storeId = $owner->store_id;

        if (User::hasReachedEmployeeLimit($storeId)) {
            return back()->withErrors([
                'limit' => 'You have reached the maximum of ' . User::MAX_EMPLOYEES_PER_STORE . ' employees for this store.',
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:20', 'regex:/^[a-z0-9_]+$/', Rule::unique('users', 'username')],
            'phone' => ['required', 'string', 'max:20', Rule::unique('users', 'phone')],
            'role' => ['required', 'string', Rule::in(['cashier'])],
            'password' => ['required', Password::defaults()],
        ], [
            'username.regex' => 'Username hanya boleh huruf kecil, angka, dan underscore.',
        ]);

        DB::beginTransaction();

        try {
            User::create([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'email' => $validated['username'] . '@employee.' . $storeId . '.local',
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'store_id' => $storeId,
                'invited_by' => $owner->id,
                'locale' => $owner->locale,
                'phone_verified_at' => now(),
            ]);

            DB::commit();

            return back()->with('success', 'Employee account created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create employee account. Please try again.']);
        }
    }

    public function invite(Request $request)
    {
        $owner = Auth::user();
        $storeId = $owner->store_id;

        if (User::hasReachedEmployeeLimit($storeId)) {
            return back()->withErrors([
                'limit' => 'You have reached the maximum of ' . User::MAX_EMPLOYEES_PER_STORE . ' employees for this store.',
            ]);
        }

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'role' => ['required', 'string', Rule::in(['cashier'])],
        ]);

        $invitation = EmployeeInvitation::create([
            'token' => EmployeeInvitation::generateToken(),
            'store_id' => $storeId,
            'invited_by' => $owner->id,
            'role' => $validated['role'],
            'name' => $validated['name'] ?? null,
            'expires_at' => now()->addDays(3),
        ]);

        return back()->with('success', 'Invite link created. Share it with your new employee.')
            ->with('inviteToken', $invitation->token);
    }

    public function revokeInvitation(EmployeeInvitation $invitation)
    {
        $owner = Auth::user();

        if ($invitation->store_id !== $owner->store_id) {
            abort(403);
        }

        $invitation->delete();

        return back()->with('success', 'Invitation revoked.');
    }

    public function destroy(User $employee)
    {
        $owner = Auth::user();

        if ($employee->store_id !== $owner->store_id || $employee->role === 'owner') {
            abort(403);
        }

        $employee->delete();

        return back()->with('success', 'Employee removed.');
    }

    public function showInvite(string $token)
    {
        $invitation = EmployeeInvitation::where('token', $token)->first();

        if (!$invitation || !$invitation->isValid()) {
            return Inertia::render('auth/InviteExpired', [
                'titlePage' => 'Invite Invalid',
            ]);
        }

        return Inertia::render('auth/ClaimInvite', [
            'titlePage' => 'Join the Team',
            'token' => $token,
            'storeName' => $invitation->store->name,
            'role' => $invitation->role,
            'suggestedName' => $invitation->name,
        ]);
    }

    public function claimInvite(Request $request, string $token)
    {
        $invitation = EmployeeInvitation::where('token', $token)->first();

        if (!$invitation || !$invitation->isValid()) {
            return back()->withErrors(['token' => 'This invite link is no longer valid.']);
        }

        if (User::hasReachedEmployeeLimit($invitation->store_id)) {
            return back()->withErrors(['limit' => 'This store has reached its employee limit.']);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'min:3', 'max:20', 'regex:/^[a-z0-9_]+$/', Rule::unique('users', 'username')],
            'phone' => ['required', 'string', 'max:20', Rule::unique('users', 'phone')],
            'password' => ['required', Password::defaults()],
        ], [
            'username.regex' => 'Username hanya boleh huruf kecil, angka, dan underscore.',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'email' => $validated['username'] . '@employee.' . $invitation->store_id . '.local',
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => $invitation->role,
                'store_id' => $invitation->store_id,
                'invited_by' => $invitation->invited_by,
                'approval_status' => 'pending',
                'phone_verified_at' => now(),
            ]);

            $invitation->markAsUsed($user->id);

            DB::commit();

            Session::put('pending_employee_id', $user->id);
            Session::save();

            return redirect()->route('employee.pending')
                ->with('success', 'Account created. Waiting for owner approval.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create your account. Please try again.']);
        }
    }

    public function approve(User $employee)
    {
        $owner = Auth::user();

        if ($employee->store_id !== $owner->store_id) {
            abort(403);
        }

        $employee->update(['approval_status' => 'approved']);

        return back()->with('success', 'Employee approved. They can now log in.');
    }

    public function reject(User $employee)
    {
        $owner = Auth::user();

        if ($employee->store_id !== $owner->store_id) {
            abort(403);
        }

        $employee->forceDelete();

        return back()->with('success', 'Employee request rejected and removed.');
    }
}