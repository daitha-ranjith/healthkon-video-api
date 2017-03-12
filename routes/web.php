<?php

Auth::routes();

Route::get('/', function () {
	return view('home');
});

Route::group(['middleware' => 'auth'], function () {
	Route::get('dashboard', 'DashboardController@index');

	Route::resource('user', 'UserController');

	Route::get('account', 'AccountController@index')->name('account');
	Route::post('account/change-password', 'AccountController@changePassword')->name('account.change-password');
	Route::put('account/reset-api-token', 'AccountController@resetApiToken')->name('account.reset-api-token');

	Route::get('billing', 'AccountController@billing')->name('account.billing');

	Route::get('demo/conference', function () {
		$token = request()->user()->api_token;
		$url = url( config('app.url') . "/api/authorize?api_token=" . $token );
		$data = json_decode(file_get_contents($url));

		return view('demo.conference')->withToken($data->token);
	});
});
