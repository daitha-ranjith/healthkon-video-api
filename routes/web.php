<?php

Auth::routes();

Route::get('/', function () {
	return view('home');
});

Route::group(['middleware' => 'auth'], function () {
	Route::get('dashboard', 'DashboardController@index');

	Route::resource('user', 'UserController');

	Route::get('account', 'AccountController@index');
	Route::post('account/change-password', 'AccountController@changePassword')->name('account.change-password');
	Route::put('account/reset-api-token', 'AccountController@resetApiToken')->name('account.reset-api-token');

	Route::get('billing', 'AccountController@billing')->name('account.billing');
});
