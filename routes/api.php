<?php

Route::group(['middleware' => 'auth:api'], function () {

	Route::group(['prefix' => 'conference'], function () {

		Route::post('connect', function () {
			return [
				'status' => true,
				'jwt' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTSzVhYjYzNTVmMzE1N2NjNmM2MzVlODA3MjYwMWYxYzQ5LTE0ODg2NjAxNzAiLCJpc3MiOiJTSzVhYjYzNTVmMzE1N2NjNmM2MzVlODA3MjYwMWYxYzQ5Iiwic3ViIjoiQUNlNGY5NDE3NWM2NGNjZmM5YjEyNjZjZTc3NTlhYWMxZiIsImV4cCI6MTQ4ODY2Mzc3MCwiZ3JhbnRzIjp7ImlkZW50aXR5IjoxNDg4NjYwMTcwLCJ2aWRlbyI6eyJjb25maWd1cmF0aW9uX3Byb2ZpbGVfc2lkIjoiVlM1NGFiNmYxZTVlNmE5YzBkYTQ1OGNmYWFlNWVjYTAxYyJ9fX0.RCPqlu1xC5ykeRFGwccq67LaduVzS67Y02ayrO7c_C8',
				'message' => 'Connected'
			];
		});

		Route::post('disconnect', function () {
			return 'disconnected';
		});

	});

});