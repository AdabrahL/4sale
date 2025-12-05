<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class MakeFirstUserAdmin extends Seeder
{
    public function run()
    {
        // Make the first user an admin
        $user = User::first();
        if ($user) {
            $user->is_admin = true;
            $user->save();
            $this->command->info("User {$user->name} ({$user->email}) is now an admin!");
        } else {
            $this->command->error("No users found in database.");
        }
    }
}
