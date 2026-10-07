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
        Schema::create('post_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_id')->nullable();
            $table->boolean('is_home')->default(false);
            $table->timestamps();

            $table->foreign('parent_id')
                ->references('id')
                ->on('post_categories')
                ->cascadeOnDelete();
        });

        Schema::create('post_category_translations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('slug', 190)->index();
            $table->string('locale', 5)->index();
            $table->uuid('post_category_id');
            $table->timestamps();

            $table->unique(['slug']);
            $table->unique(['post_category_id', 'locale']);

            $table->foreign('post_category_id')
                ->references('id')
                ->on('post_categories')
                ->cascadeOnDelete();
        });

        Schema::create('post_category', function (Blueprint $table) {
            $table->uuid('post_id');
            $table->uuid('post_category_id');

            $table->primary(['post_id', 'post_category_id']);

            $table->foreign('post_id')
                ->references('id')
                ->on('posts')
                ->cascadeOnDelete();

            $table->foreign('post_category_id')
                ->references('id')
                ->on('post_categories')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_category');
        Schema::dropIfExists('post_category_translations');
        Schema::dropIfExists('post_categories');
    }
};
