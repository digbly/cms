<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->timestamps();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('menu_id');
            $table->uuid('parent_id')->nullable()->index();

            $table->string('box_key', 100);
            $table->string('menuable_type', 100)->nullable()->index();
            $table->string('menuable_id')->nullable()->index();
            $table->string('link')->nullable();
            $table->string('icon')->nullable();
            $table->string('target', 10)->default('_self');
            $table->integer('display_order')->index();
            $table->boolean('is_home')->default(false);

            $table->foreign('menu_id')
                ->references('id')
                ->on('menus')
                ->cascadeOnDelete();
            $table->foreign('parent_id')
                ->references('id')
                ->on('menu_items')
                ->cascadeOnDelete();
        });

        Schema::create('menu_item_translations', function (Blueprint $table) {
            $table->id();
            $table->uuid('menu_item_id')->index();
            $table->string('locale', 10)->index();
            $table->string('label', 100);
            $table->unique(['menu_item_id', 'locale']);

            $table->foreign('menu_item_id')
                ->references('id')
                ->on('menu_items')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_item_translations');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
    }
};
