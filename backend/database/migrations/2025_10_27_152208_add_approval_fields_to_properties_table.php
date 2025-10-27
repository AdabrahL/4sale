<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration is defensive: it will only add columns that do not already exist,
     * so it is safe to run on databases that may already contain some of these fields.
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            // is_approved
            if (! Schema::hasColumn('properties', 'is_approved')) {
                $table->boolean('is_approved')->default(false);
            }

            // approved_at
            if (! Schema::hasColumn('properties', 'approved_at')) {
                $table->timestamp('approved_at')->nullable();
            }

            // approved_by (store approver user id)
            if (! Schema::hasColumn('properties', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable();
                // If you want to add a foreign key constraint, uncomment below and ensure users table exists:
                // $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            }

            // rejection_reason
            if (! Schema::hasColumn('properties', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * Drops the added columns if they exist.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            if (Schema::hasColumn('properties', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }

            if (Schema::hasColumn('properties', 'approved_by')) {
                $table->dropColumn('approved_by');
            }

            if (Schema::hasColumn('properties', 'approved_at')) {
                $table->dropColumn('approved_at');
            }

            if (Schema::hasColumn('properties', 'is_approved')) {
                $table->dropColumn('is_approved');
            }
        });
    }
};