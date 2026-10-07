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
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('status', 20)->default('draft');
            $table->unsignedBigInteger('views')->default(0);
            $table->uuid('user_id')->nullable();
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });

        Schema::create('post_translations', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug', 190)->index();
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('locale', 5)->index();
            $table->uuid('post_id');
            $table->timestamps();

            $table->unique(['slug']);
            $table->unique(['post_id', 'locale']);

            $table->foreign('post_id')
                ->references('id')
                ->on('posts')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_translations');
        Schema::dropIfExists('posts');
    }
};
