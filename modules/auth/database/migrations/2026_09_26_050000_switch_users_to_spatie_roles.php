<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_super_admin')->default(false)->after('email');
        });

        DB::table('users')->where('role', 'admin')->update(['is_super_admin' => true]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('email');
        });

        DB::table('users')->where('is_super_admin', true)->update(['role' => 'admin']);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_super_admin');
        });
    }
};
