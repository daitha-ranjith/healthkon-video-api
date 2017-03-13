<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Stripe, Mailgun, SparkPost and others. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
    ],

    'ses' => [
        'key' => env('SES_KEY'),
        'secret' => env('SES_SECRET'),
        'region' => 'us-east-1',
    ],

    'sparkpost' => [
        'secret' => env('SPARKPOST_SECRET'),
    ],

    'stripe' => [
        'model' => App\User::class,
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
    ],

    'twilio' => [
        'app' => env('TWILIO_APP_NAME'),
        'sid' => env('TWILIO_ACCOUNT_SID'),
        'key' => env('TWILIO_API_KEY'),
        'secret' => env('TWILIO_API_SECRET'),
        'video' => [
            'sid' => env('TWILIO_VIDEO_PROFILE_CONFIGURATION_SID')
        ],
        'chat' => [
            'sid' => env('TWILIO_IP_MESSAGING_SERVICE_SID')
        ]
    ]

];

















