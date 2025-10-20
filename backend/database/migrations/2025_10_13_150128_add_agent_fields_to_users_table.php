<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAgentFieldsToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('photo')->nullable()->after('phone'); // profile picture path/url
            $table->text('bio')->nullable()->after('photo');
            $table->json('socials')->nullable()->after('bio'); // social links as json
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'photo', 'bio', 'socials']);
        });
    }
}