<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('theme_sidebars', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('sidebar', 100)->index();
            $table->string('widget', 100)->index();
            $table->string('theme', 100)->nullable()->index();
            $table->json('data')->nullable();
            $table->integer('display_order')->default(1)->index();
            $table->timestamps();
        });

        Schema::create('theme_sidebar_translations', function (Blueprint $table) {
            $table->id();
            $table->uuid('theme_sidebar_id')->index();
            $table->string('locale', 10)->index();
            $table->string('label', 190)->nullable();
            $table->json('fields')->nullable();
            $table->timestamps();
            $table->unique(['theme_sidebar_id', 'locale']);

            $table->foreign('theme_sidebar_id')
                ->references('id')
                ->on('theme_sidebars')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theme_sidebar_translations');
        Schema::dropIfExists('theme_sidebars');
    }
};
