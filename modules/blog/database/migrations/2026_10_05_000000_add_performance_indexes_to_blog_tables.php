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
        Schema::table('posts', function (Blueprint $table) {
            $table->index('status', 'posts_status_index');
            $table->index('views', 'posts_views_index');
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->index(
                ['post_id', 'status', 'parent_id', 'created_at'],
                'comments_post_status_parent_created_index'
            );
            $table->index('status', 'comments_status_index');
        });

        Schema::table('post_category', function (Blueprint $table) {
            $table->index('post_category_id', 'post_category_category_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex('posts_status_index');
            $table->dropIndex('posts_views_index');
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropIndex('comments_post_status_parent_created_index');
            $table->dropIndex('comments_status_index');
        });

        Schema::table('post_category', function (Blueprint $table) {
            $table->dropIndex('post_category_category_index');
        });
    }
};
