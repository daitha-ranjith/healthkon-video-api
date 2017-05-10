<?php

namespace App;

use App\Participant;
use Illuminate\Database\Eloquent\Model;

class Conference extends Model
{
	protected $fillable = [
		'user_id',
		'room_sid',
		'room_name'
	];

    public function participants()
    {
    	return $this->hasMany(Participant::class);
    }

    public function duration()
    {
		return $this->participants->max('duration');
    }

    public function date()
    {
    	return $this->created_at->toFormattedDateString();
    }

    public function time()
    {
    	return $this->created_at->toTimeString();
    }
}
