<?php

namespace App;

use App\Conference;
use Illuminate\Database\Eloquent\Model;

class Participant extends Model
{
    protected $fillable = [	
    	'conference_id',
    	'participant',
    	'participant_sid'
    ];

    public function conference()
    {
    	return $this->belongsTo(Conference::class);
    }
}
