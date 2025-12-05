<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email}';
    protected $description = 'Make a user an admin by their email address';

    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $user->is_admin = true;
        $user->save();

        $this->info("User {$user->name} ({$user->email}) is now an admin!");
        return 0;
    }
}
