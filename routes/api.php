<?php

Route::group(['middleware' => 'auth:api'], function () {
	# Route for authenticating and generating the user jwt token
	Route::get('authorize', 'JwtController@authenticate');

});

Route::group(['prefix' => 'conference', 'middleware' => 'cors'], function () {
	// Authorize the conference connection
	Route::group(['middleware' => ['jwt.auth', 'jwt.refresh']], function () {
		Route::post('authenticate', 'ConferenceController@authenticate');
	});

	// Conference Connection API
	Route::post('connect', 'ConferenceController@connect');

	// Conference Disconnection API
	Route::post('disconnect', 'ConferenceController@disconnect');
});