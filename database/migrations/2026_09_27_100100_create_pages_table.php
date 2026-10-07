<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('status', 20)->index()->default('published');
            $table->string('template', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('page_translations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug', 190)->index();
            $table->longText('content')->nullable();
            $table->text('description')->nullable();
            $table->string('locale', 10)->index();
            $table->uuid('page_id');
            $table->timestamps();

            $table->unique(['page_id', 'locale']);
            $table->unique(['slug']);

            $table->foreign('page_id')
                ->references('id')
                ->on('pages')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_translations');
        Schema::dropIfExists('pages');
    }
};
