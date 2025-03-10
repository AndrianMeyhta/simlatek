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
        Schema::create('tahapanconstrains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projecttahapan_id')->constrained('projecttahapans')->onDelete('cascade');
            $table->string('constrain_type'); // Misalnya: 'jadwalrapat', 'upload_file', dll.
            $table->enum('status', ['pending', 'fulfilled'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tahapanconstrains');
    }
};
