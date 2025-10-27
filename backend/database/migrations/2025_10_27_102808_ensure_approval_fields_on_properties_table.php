<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('properties', function (Blueprint $table) {
            // Add approved_at if missing
            if (! Schema::hasColumn('properties', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('is_approved');
            }

            // Add approved_by if missing
            if (! Schema::hasColumn('properties', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable()->after('approved_at');
                // If you want a FK constraint uncomment the following line and ensure users table exists:
                // $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    public function down()
    {
        Schema::table('properties', function (Blueprint $table) {
            if (Schema::hasColumn('properties', 'approved_by')) {
                // if you added a foreign key you must drop it first:
                // $table->dropForeign(['approved_by']);
                $table->dropColumn('approved_by');
            }
            if (Schema::hasColumn('properties', 'approved_at')) {
                $table->dropColumn('approved_at');
            }
        });
    }
};