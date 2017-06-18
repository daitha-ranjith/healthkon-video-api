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
        $identity = request()->has('identity') ? request()->identity : str_random(5);

        $client->setIdentity($identity);
        $client->generateToken();

        return response()->json([
            'user_id' => request()->user()->id,
            'video_jwt' => $client->getVideoToken(),
            'chat_jwt' => $client->getChatToken()
        ]);
    }

    public function connect()
    {
        try {
            $conference_data = request()->only('user_id', 'room_sid', 'room_name');
            $participant_data = request()->only('participant', 'participant_sid');

            $conference = Conference::where('room_sid', $conference_data['room_sid'])->first();

            if ( ! $conference) {
                $conference = Conference::create($conference_data);
            }

            $participant_data['conference_id'] = $conference->id;

            $participant = Participant::firstOrCreate($participant_data);

            return 'OK';
        } catch (Exception $e) {
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
            return response("Unauthorized access.", 401);
        }

        if ($participant->created_at == $participant->updated_at) {
            $participant->touch();
            $participant->duration = $participant->updated_at->diffInSeconds($participant->created_at);
            $participant->save();
        }

        return 'OK';
    }
}
