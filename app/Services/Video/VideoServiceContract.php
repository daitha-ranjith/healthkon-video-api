<?php

namespace App\Services\Video;

interface VideoServiceContract
{
	public function getVideoToken();

	public function getChatToken();
}