<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
    ],

    'github' => [
        'client_id' => env('GITHUB_CLIENT_ID'),
        'client_secret' => env('GITHUB_CLIENT_SECRET'),
    ],

    'x' => [
        'client_id' => env('X_CLIENT_ID'),
        'client_secret' => env('X_CLIENT_SECRET'),
    ],

    'linkedin-openid' => [
        'client_id' => env('LINKEDIN_CLIENT_ID'),
        'client_secret' => env('LINKEDIN_CLIENT_SECRET'),
    ],

    'gitlab' => [
        'client_id' => env('GITLAB_CLIENT_ID'),
        'client_secret' => env('GITLAB_CLIENT_SECRET'),
    ],

    'bitbucket' => [
        'client_id' => env('BITBUCKET_CLIENT_ID'),
        'client_secret' => env('BITBUCKET_CLIENT_SECRET'),
    ],

    'slack' => [
        'client_id' => env('SLACK_CLIENT_ID'),
        'client_secret' => env('SLACK_CLIENT_SECRET'),
    ],

    'twitch' => [
        'client_id' => env('TWITCH_CLIENT_ID'),
        'client_secret' => env('TWITCH_CLIENT_SECRET'),
    ],

];
