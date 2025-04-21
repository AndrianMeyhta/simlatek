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
        Schema::create('rbieextractions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('permintaan_id'); // Relasi ke permintaan
            $table->unsignedBigInteger('tahapanconstrain_id')->nullable(); // Relasi ke tahapan constrain
            $table->json('extracted_data'); // Hasil ekstraksi dalam JSON
            $table->timestamps();

            $table->foreign('permintaan_id')->references('id')->on('permintaans')->onDelete('cascade');
            $table->foreign('tahapanconstrain_id')->references('id')->on('tahapanconstrains')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rbieextractions');
    }
};
