<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_blocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('container', 100);
            $table->string('block', 100);
            $table->json('data')->nullable();
            $table->string('theme', 100)->nullable()->index();
            $table->integer('display_order')->default(1)->index();
            $table->uuid('page_id')->index();
            $table->timestamps();

            $table->foreign('page_id')
                ->references('id')
                ->on('pages')
                ->cascadeOnDelete();
        });

        Schema::create('page_block_translations', function (Blueprint $table) {
            $table->id();
            $table->uuid('page_block_id')->index();
            $table->string('locale', 10)->index();
            $table->string('label')->nullable();
            $table->json('fields')->nullable();
            $table->timestamps();

            $table->unique(['page_block_id', 'locale']);

            $table->foreign('page_block_id')
                ->references('id')
                ->on('page_blocks')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_block_translations');
        Schema::dropIfExists('page_blocks');
    }
};
