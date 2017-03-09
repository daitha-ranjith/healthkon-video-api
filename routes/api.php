<?php

use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\VideoGrant;

Route::group(['middleware' => 'auth:api'], function () {

	Route::group(['prefix' => 'conference', 'middleware' => 'cors'], function () {

		Route::post('connect', function () {

			$TWILIO_APP_NAME = 'TwilioTest';
			$TWILIO_ACCOUNT_SID = 'ACa95ac597175dac43c52c5b1171ed2e92';
			$TWILIO_CONFIGURATION_SID = 'VS2da9afa479c0bef4d0c356519e0e32d7';
			$TWILIO_API_KEY = 'SK6f9ab973c5132625142d1adb8a680b4c';
			$TWILIO_API_SECRET = '3tke0W2FQ1DQQtLWwGli357z0yxwGxC0';

			$token = new AccessToken(
			    $TWILIO_ACCOUNT_SID, 
			    $TWILIO_API_KEY,
			    $TWILIO_API_SECRET, 
			    3600,
			    time()
			);

			$grant = new VideoGrant();
			$grant->setConfigurationProfileSid($TWILIO_CONFIGURATION_SID);
			$token->addGrant($grant);
			$token = $token->toJWT();

			return [
				'status' => true,
				'jwt' => $token,
				'message' => 'Connected'
			];
		});

		Route::post('disconnect', function () {
			return 'disconnected';
		});

	});

});