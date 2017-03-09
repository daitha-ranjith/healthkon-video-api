<?php

namespace App\Http\Controllers;

use JWTAuth;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\JWTException;

class JwtController extends Controller
{
    public function authenticate()
    {
    	$user = request()->user();

    	try {
    		$token = JWTAuth::fromUser($user, ['exp' => Carbon::now()->addHours(6)->timestamp]);

            if ( ! $token ) {
                return response()->json(['error' => 'Invalid API Token.'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['error' => 'Could not create token, something went wrong.'], 500);
        }

        return response()->json([
        	'token'   => $token
    	]);
    }
}
