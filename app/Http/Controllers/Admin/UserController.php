<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{

    /**
     * Returns the currently authenticated user.
     */
    private function me(): User
    {
        /** @var User */
        return auth()->user();
    }

    /**
     * Only the primary Super Admin (seeded from .env) may act on other
     * super_admin accounts.  Any other super_admin is considered a peer and
     * cannot manage fellow super_admins.
     */
    private function canManageSuperAdmin(): bool
    {
        return $this->me()->isSuperAdmin() && $this->me()->isPrimary();
    }

    public function index(Request $request)
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $role = $request->input('role');
        if ($role && $role !== 'all') {
            $query->where('role', $role);
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/users/page', [
            'users' => $users,
            'filters' => $request->only('search', 'role'),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/users/create/page');
    }

    public function store(Request $request)
    {
        if ($request->role === 'super_admin' && !$this->canManageSuperAdmin()) {
            return redirect()
                ->back()
                ->with('error', 'Only the primary Super Admin can create Super Admin accounts.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users'],
            'email' => ['required', 'email', 'unique:users'],
            'country_code' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in(['super_admin', 'owner', 'cashier'])],
            'locale' => ['nullable', Rule::in(['en', 'id'])],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if (!empty($data['phone']) && !empty($data['country_code'])) {
            $code = ltrim($data['country_code'], '+');
            $data['phone'] = $code . ltrim($data['phone'], '0');
        }

        $data['password'] = Hash::make($data['password']);

        User::create($data);

        return redirect()
            ->route('admin.users')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        if ($user->isPrimary()) {
            return redirect()
                ->route('admin.users')
                ->with('error', 'The primary Super Admin account cannot be edited here.');
        }

        if ($user->isSuperAdmin() && !$this->canManageSuperAdmin()) {
            return redirect()
                ->route('admin.users')
                ->with('error', 'Only the primary Super Admin can edit other Super Admin accounts.');
        }

        if ($this->me()->id === $user->id) {
            return redirect()
                ->route('admin.users')
                ->with('error', 'You cannot edit your own account here. Use your profile page instead.');
        }

        return Inertia::render('admin/users/edit/page', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        if ($user->isPrimary()) {
            return redirect()
                ->route('admin.users')
                ->with('error', 'The primary Super Admin account cannot be modified.');
        }

        if ($user->isSuperAdmin() && !$this->canManageSuperAdmin()) {
            return redirect()
                ->route('admin.users')
                ->with('error', 'Only the primary Super Admin can modify Super Admin accounts.');
        }

        if ($this->me()->id === $user->id && $request->role !== $user->role) {
            return redirect()
                ->back()
                ->with('error', 'You cannot change your own role. Please contact another administrator.');
        }

        if ($request->role === 'super_admin' && !$this->canManageSuperAdmin()) {
            return redirect()
                ->back()
                ->with('error', 'Only the primary Super Admin can assign the Super Admin role.');
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'country_code' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', Rule::in(['super_admin', 'owner', 'cashier'])],
            'locale' => ['nullable', Rule::in(['en', 'id'])],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        if (!empty($data['phone']) && !empty($data['country_code'])) {
            $code = ltrim($data['country_code'], '+');
            $data['phone'] = $code . ltrim($data['phone'], '0');
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()
            ->route('admin.users')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->isPrimary()) {
            return redirect()
                ->route('admin.users')
                ->with('error', 'The primary Super Admin account cannot be deleted.');
        }

        if ($user->isSuperAdmin() && !$this->canManageSuperAdmin()) {
            return redirect()
                ->route('admin.users')
                ->with('error', 'Only the primary Super Admin can delete Super Admin accounts.');
        }

        if ($this->me()->id === $user->id) {
            return redirect()
                ->route('admin.users')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()
            ->route('admin.users')
            ->with('success', 'User deleted successfully.');
    }
}