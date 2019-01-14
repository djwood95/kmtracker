<?php

$dotenv = Dotenv\Dotenv::create(__DIR__);
$dotenv->load();
$dotenv->required(['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'ENV_NAME']);

return [
    'settings' => [
        'displayErrorDetails' => true, // set to false in production
        'addContentLengthHeader' => false, // Allow the web server to send the content-length header

        // DB Connection
        'db' => [
            'host' => $_ENV['DB_HOST'],
            'dbname' => $_ENV['DB_NAME'],
            'user' => $_ENV['DB_USER'],
            'password' => $_ENV['DB_PASS']
        ],

        // Monolog settings
        'logger' => [
            'name' => 'slim-app',
            'path' => isset($_ENV['docker']) ? 'php://stdout' : __DIR__ . '/../logs/app.log',
            'level' => \Monolog\Logger::DEBUG,
        ],

        'determineRouteBeforeAppMiddleware' => true
    ]
];
