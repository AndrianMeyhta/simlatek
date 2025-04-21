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
        Schema::create('managings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('permintaan_id')->constrained()->onDelete('cascade');
            $table->string('role')->default('member'); // Misalnya: 'superadmin', 'creator', 'member'
            $table->timestamps();

            // Unik: Kombinasi user_id dan permintaan_id untuk mencegah duplikat
            $table->unique(['user_id', 'permintaan_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('managings');
    }
};
