<?php

use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\VideoGrant;

Route::group(['middleware' => 'auth:api'], function () {

	Route::group(['prefix' => 'conference', 'middleware' => 'cors'], function () {

		Route::post('connect', function () {

			$appName = 'TwilioTest';
			$TWILIO_ACCOUNT_SID = 'ACe4f94175c64ccfc9b1266ce7759aac1f';
			$TWILIO_CONFIGURATION_SID = 'VS54ab6f1e5e6a9c0da458cfaae5eca01c';
			$TWILIO_API_KEY = 'SK5ab6355f3157cc6c635e8072601f1c49';
			$TWILIO_API_SECRET = 'Tq6B2qleTK9NI2PL0DrxGqtOTNQHJ3f9';

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