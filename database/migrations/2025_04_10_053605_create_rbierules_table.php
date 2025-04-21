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
        Schema::create('rbierules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tahapanconstrain_id'); // Relasi ke tahapanconstrain
            $table->string('name'); // Nama aturan, misalnya "File SKPL Rules"
            $table->json('preprocessing')->nullable(); // Aturan preprocessing dalam JSON
            $table->json('matching_rules'); // Aturan regex atau matching dalam JSON
            $table->timestamps();

            $table->foreign('tahapanconstrain_id')
                  ->references('id')
                  ->on('tahapanconstrains')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rbierules');
    }
};
