<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('properties', function (Blueprint $table) {
            if (! Schema::hasColumn('properties', 'rejection_reason')) {
                // add rejection_reason without referencing a column that might not be present
                $table->text('rejection_reason')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('properties', function (Blueprint $table) {
            if (Schema::hasColumn('properties', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }
        });
    }
};