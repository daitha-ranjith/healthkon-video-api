<?php

namespace App\Http\Controllers;

use Log;
use Exception;
use Carbon\Carbon;
use App\Conference;
use App\Participant;
use Illuminate\Http\Request;
use App\Services\Video\VideoServiceContract;

class ConferenceController extends Controller
{
    public function authenticate(VideoServiceContract $client)
    {
        $identity = request()->identity;

        // 	get the token
    	$token = $client->getToken($identity);

    	// 	respond back with the Twilio JWT token
        return response()->json([
            'user_id' => request()->user()->id,
            'jwt' => $token
        ]);
    }

    public function connect()
    {
        try {
            $conference_data = request()->only('user_id', 'room_sid', 'room_name');
            $participant_data = request()->only('participant', 'participant_sid');

            $conference = Conference::firstOrCreate($conference_data);

            $participant_data['conference_id'] = $conference->id;

            $participant = Participant::firstOrCreate($participant_data);

            return 'OK';
        } catch (Exception $e) {
            Log::error("Connection Error: {$e->getMessage()}");
            return response("Unauthorized access.", 401);
        }
    }

    public function disconnect()
    {
        try {
            $participant = Participant::where([
                'participant_sid' => request()->participant_sid
            ])->first();

            if ( ! $participant) return response('Unauthorized access.', 401);
        } catch (Exception $e) {
            Log::error("Disconnection Error: {$e->getMessage()}");
            return response("Unauthorized access.", 401);
        }

        $participant->touch();

        $participant->duration = $participant->updated_at->diffInSeconds($participant->created_at);
        $participant->save();

        return 'OK';
    }
}
