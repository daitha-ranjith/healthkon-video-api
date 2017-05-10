<?php

namespace App\Http\Controllers;

use App\Conference;

class AccountController extends Controller
{
    public function index()
    {
    	return view('account.index');
    }

    public function billing()
    {
        $conferences = Conference::with('participants')->paginate(10);

        return view('billing')->withConferences($conferences);
    }

    public function resetApiToken()
    {
    	$user = request()->user();
    	$user->api_token = str_random(60);
    	$user->save();

    	return redirect()->back()->withStatus('API token has been successfully resetted!');
    }

    public function changePassword()
    {
    	$request = request();

    	$this->validate($request, [
    		'password' => 'required|min:6|confirmed'
		]);

    	$inputs = $request->only('password');

    	$user = request()->user();
    	$user->password = bcrypt($request['password']);
    	$user->save();

    	return redirect()->back()->withStatus('Password successfully changed!');
    }
}
