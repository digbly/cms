<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'AI Website API Documentation',
    description: 'API documentation for AI Website backend service'
)]
#[OA\PathItem(
    path: '/up',
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    bearerFormat: 'JWT',
    scheme: 'bearer'
)]
abstract class Controller
{
    //
}
