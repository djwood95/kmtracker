<?php

use Firebase\JWT\JWT;
use Tuupola\Middleware\JwtAuthentication;

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

/* Check Token, returns 401 if it doesn't pass */
$app->add(new JwtAuthentication([
	"secret" => $_ENV['JWT_SECRET'],
	"path" => "/api",
]));

/* Send userId to route */
$getTokenData = function($request, $response, $next) {
	$route = $request->getAttribute('route');
	$routeName = $route->getName();
	$methods = $route->getMethods();

	try {
		if($methods[0] != "OPTIONS") {
			$token = $request->getHeaders()["HTTP_AUTHORIZATION"][0];
			$token = explode(" ", $token)[1];
			$secret = $_ENV['JWT_SECRET'];
			$decoded = (array) JWT::decode($token, $secret, array('HS256'));

			$userId = $decoded['userId'];
			$request = $request
				->withAttribute('userId', $userId);

			$response = $next($request, $response);
			return $response;
			
		} else {
			$response = $next($request, $response);
			return $response;
		}
	} catch(Firebase\JWT\ExpiredException $e) {
		return $response->withStatus(401)
		->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Host, Connection, Authorization, Cache-Control, Content-Type, Upgrade-Insecure-Requests, User-Agent, Accept, Referer, Accept-Encoding, Accept-Language, If-None-Match')
		->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
		->withJson($e);
	} catch(Exception $e) {
		return $response->withStatus(500)
		->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Host, Connection, Authorization, Cache-Control, Content-Type, Upgrade-Insecure-Requests, User-Agent, Accept, Referer, Accept-Encoding, Accept-Language, If-None-Match')
		->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
		->withJson("General Error: " . $e);
	}

};
/**/


$corsHeaders = function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Host, Connection, Authorization, Cache-Control, Content-Type, Upgrade-Insecure-Requests, User-Agent, Accept, Referer, Accept-Encoding, Accept-Language, If-None-Match')
		->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
};

$app->add($corsHeaders);