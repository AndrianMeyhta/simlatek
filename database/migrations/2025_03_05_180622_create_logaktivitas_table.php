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
        Schema::create('logaktivitas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projectprogress_id')->constrained('projectprogresses')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action'); // Misalnya: 'mengatur jadwal rapat', 'mengunggah file', 'konfirmasi tahapan'
            $table->text('description')->nullable(); // Detail tambahan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logaktivitas');
    }
};
