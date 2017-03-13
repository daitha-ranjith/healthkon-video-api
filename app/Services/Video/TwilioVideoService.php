<?php

namespace App\Services\Video;

use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\VideoGrant;
use Twilio\Jwt\Grants\IpMessagingGrant;

class TwilioVideoService implements VideoServiceContract
{
	private $app;

	private $account_sid;

	private $api_key;

	private $api_secret;

	private $identity;

	private $token;

	public function __construct()
	{
		$this->app = config('services.twilio.app');
		$this->account_sid = config('services.twilio.sid');
		$this->api_key = config('services.twilio.key');
		$this->api_secret = config('services.twilio.secret');
	}

	public function setIdentity($identity)
	{
		$this->identity = $identity;
	}

	public function generateToken()
	{
		$token = new AccessToken(
		    $this->account_sid,
		    $this->api_key,
		    $this->api_secret,
		    3600,
		    $this->identity
		);

		$this->token = $token;
	}

	public function getVideoToken()
	{
		$configuration_sid = config('services.twilio.video.sid');

		$grant = new VideoGrant();
		$grant->setConfigurationProfileSid($configuration_sid);

		$token = $this->token->addGrant($grant);

		return $token->toJWT();
	}

	public function getChatToken()
	{
		$ipm_service_id = config('services.twilio.chat.sid');

		$endpoint = $this->app . ":" . $this->identity . ":" . 'web';

		$ipm_grant = new IpMessagingGrant;
	    $ipm_grant->setServiceSid($ipm_service_id);
	    $ipm_grant->setEndpointId($endpoint);

	    $token = $this->token->addGrant($ipm_grant);

		return $token->toJWT();
	}

}