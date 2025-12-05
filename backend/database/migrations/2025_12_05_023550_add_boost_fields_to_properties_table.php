<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->boolean('is_boosted')->default(false)->after('is_approved');
            $table->timestamp('boost_expires_at')->nullable()->after('is_boosted');
            $table->integer('boost_plan')->nullable()->after('boost_expires_at')->comment('Boost duration in days (7, 14, or 30)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['is_boosted', 'boost_expires_at', 'boost_plan']);
        });
    }
};
