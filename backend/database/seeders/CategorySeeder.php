<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = ['Residential', 'Commercial', 'Land', 'Others'];
        foreach ($categories as $name) {
            Category::create(['name' => $name]);
        }
    }
}