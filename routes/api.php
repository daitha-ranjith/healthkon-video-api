<?php

Route::group(['middleware' => 'auth:api'], function () {

	Route::group(['prefix' => 'conference'], function () {

		Route::post('connect', function () {
			return 'connected';
		});

		Route::post('disconnect', function () {
			return 'disconnected';
		});

	});

});