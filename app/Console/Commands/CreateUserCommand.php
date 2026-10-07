<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Modules\Auth\Models\User;

class CreateUserCommand extends Command
{
    protected $signature = 'make:user
        {--name= : User name}
        {--email= : User email}
        {--password= : User password}
        {--super-admin : Mark as super admin}';

    protected $description = 'Create a new user interactively';

    public function handle(): int
    {
        $name = $this->option('name') ?? $this->ask('Name');
        $email = $this->option('email') ?? $this->ask('Email', fn ($v) => filter_var($v, FILTER_VALIDATE_EMAIL) ? true : 'Invalid email');
        $password = $this->option('password') ?? $this->secret('Password');

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'is_super_admin' => (bool) $this->option('super-admin'),
            'email_verified_at' => now(),
        ]);

        $this->info("User [{$user->email}] created successfully (id: {$user->id})");

        return Command::SUCCESS;
    }
}
