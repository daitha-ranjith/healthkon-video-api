<?php

namespace App\Http\Controllers;

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
            $participant = Participant::firstOrNew($participant_data);

            $conference->participants()->save($participant);

            return 'OK';
        } catch (Exception $e) {
            return response("Unauthorized access. Error: {$e->getMessage()}", 401);
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
            return response("Unauthorized access. Error: {$e->getMessage()}", 401);
        }

        $participant->touch();

        $participant->duration = $participant->updated_at->diffInSeconds($participant->created_at);
        $participant->save();
    }
}
