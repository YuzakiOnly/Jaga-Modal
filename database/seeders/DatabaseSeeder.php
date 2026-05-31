<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('🚀 Starting Database Seeder...');
        $this->command->info('');

        $this->call([
            UserSeeder::class,      
            InviteCodeSeeder::class, 
            CategorySeeder::class,  
        ]);

        $this->command->info('');
        $this->command->info('🎉 Database seeding completed successfully!');
        $this->command->info('');
    }
}