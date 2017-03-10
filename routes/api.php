<?php

Route::group(['middleware' => 'auth:api'], function () {

	# Route for authenticating and generating the user jwt token
	Route::get('authorize', 'JwtController@authenticate');

});

Route::group(['middleware' => ['jwt.auth']], function () {
	Route::group(['prefix' => 'conference', 'middleware' => 'cors'], function () {

		Route::post('connect', 'ConferenceController@connect');

		Route::post('disconnect', 'ConferenceController@connect');

	});
});