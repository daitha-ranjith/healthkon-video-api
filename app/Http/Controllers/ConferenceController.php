<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Video\VideoServiceContract;

class ConferenceController extends Controller
{
    public function connect(VideoServiceContract $client)
    {
        $identity = request()->identity;
    	// 	get the token
    	$token = $client->getToken($identity);
    	// 	log the required user with the ts

    	// 	respond back with the Twilio JWT token
        return response()->json([
            'jwt' => $token
        ]);
    }
}
