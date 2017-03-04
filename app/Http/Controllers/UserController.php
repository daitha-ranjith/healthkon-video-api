<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function create()
    {
    	
    }

    public function update()
    {
    	$user = request()->user();

    	$request = request();

    	$this->validate($request, [
    		'name' => 'required|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id
		]);

    	$inputs = $request->only(['name', 'email']);

    	$user->name = $inputs['name'];
    	$user->email = $inputs['email'];
    	$user->save();

    	return redirect()->back()->withStatus('Details successfully changed!');
    }
}
