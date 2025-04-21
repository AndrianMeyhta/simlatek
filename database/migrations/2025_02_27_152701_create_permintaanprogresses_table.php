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
        Schema::create('permintaanprogresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permintaan_id')->constrained()->onDelete('cascade');
            $table->foreignId('permintaantahapan_id')->constrained()->onDelete('cascade');
            $table->integer('percentage');
            $table->enum('status', ['upcoming', 'current', 'completed'])->default('upcoming');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projectprogresses');
    }
};
