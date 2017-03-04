<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateParticipantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('conference_id')->unsigned();
            $table->string('participant');
            $table->string('participant_id');
            $table->integer('duration')->default(0);
            $table->timestamp('connected_at');
            $table->timestamp('disconnected_at')->nullable();

            $table->foreign('conference_id')->references('id')->on('conferences')->onDelete('cascade');
            $table->unique(['conference_id', 'participant_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('participants');
    }
}
