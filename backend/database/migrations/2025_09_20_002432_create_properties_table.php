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
        Schema::create('properties', function (Blueprint $table) {
             $table->id();
        $table->string('title');
        $table->text('description');
        $table->decimal('price', 12, 2);
        $table->string('property_type'); // <-- make sure this exists
        $table->string('status');
        $table->string('location');
        $table->integer('bedrooms')->nullable();
        $table->integer('bathrooms')->nullable();
        $table->json('images')->nullable();
        $table->integer('size')->nullable();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
