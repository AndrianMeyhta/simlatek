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
        Schema::create('progressreports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('permintaanprogress_id')->constrained()->onDelete('cascade');
            $table->text('description');
            $table->integer('percentage_change'); // Perubahan progress dari update ini
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progressreports');
    }
};
