<?php

use Slim\Http\Request;
use Slim\Http\Response;

/* PUBLIC ROUTES */
$app->post('/checkLogin', function (Request $request, Response $response, array $args) {
    $username = $request->getParam('username');
    $password = $request->getParam('password');

    $util = new Util($this->db);
    $loggedInResponse = $util->checkLogin($username, $password);

    if(!$loggedInResponse["success"]) {
        return $response->withStatus(401);
    } else {
        return $response->withStatus(201)
                        ->withJson($loggedInResponse);
    }
});

$app->get('/leaderboard', function (Request $request, Response $response, array $args) {

    $main = new Main($this->db);
    $results = $main->getLeaderboardDefault();

    return $response->withJson($results);
});

$app->get('/leaderboard/{startDate}/{endDate}', function (Request $request, Response $response, array $args) {

    $main = new Main($this->db);
    $results = $main->getLeaderboard($args['startDate'], $args['endDate']);

    return $response->withJson($results);
});

$app->get('/leaderboard/lifetime', function (Request $request, Response $response, array $args) {

    $main = new Main($this->db);
    $results = $main->lifetime();

    return $response->withJson($results);
});

$app->get('/leaderboard/allSeasons', function (Request $request, Response $response, array $args) {

    $main = new Main($this->db);
    $results = $main->allSeasons();

    return $response->withJson($results);
});

$app->get('/leaderboard/groupStandings', function (Request $request, Response $response, array $args) {

    $main = new Main($this->db);
    $results = $main->groupStandings();

    return $response->withJson($results);
});

$app->get('/getUsernameList', function (Request $request, Response $response, array $args) {

    $util = new Util($this->db);
    $results = $util->getUsernameList();
    
    return $response->withJson($results);

});

$app->post('/newAccount', function (Request $request, Response $response, array $args) {

    $info = $request->getParam('info');
    $util = new Util($this->db);
    $results = $util->newAccount($info);

    return $response->withJson($results);

    //if($results) return $response->withStatus(200);
    //else return $response->withStatus(500);
});

$app->get('/getTrailSystems', function (Request $request, Response $response, array $args) {

    $main = new Main($this->db);
    $results = $main->getTrailSystems();

    return $response->withJson($results);

    //if($results) return $response->withStatus(200);
    //else return $response->withStatus(500);
});


/* API/Protected Routes */
$app->group('/api', function() use ($app) {

    $app->get('/settings/getColorGroup', function (Request $request, Response $response, array $args) {
        $userId = $request->getAttribute('userId');

        $util = new Util($this->db);
        $results = $util->getColorGroup($userId);
        return $response->withJson($results);
    });

    $app->post('/settings/saveColorGroup', function (Request $request, Response $response, array $args) {
        $userId = $request->getAttribute('userId');
        $colorgroup = $request->getParam('colorgroup');

        $util = new Util($this->db);
        $results = $util->saveColorGroup($userId, $colorgroup);
        return $response->withJson($results);
    });

    $app->post('/settings/saveNewPass', function (Request $request, Response $response, array $args) {
        $userId = $request->getAttribute('userId');
        $newPass = $request->getParam('newPass');

        $util = new Util($this->db);
        $results = $util->saveNewPass($userId, $newPass);
        if($results) return $response->withStatus(200);
        else return $response->withStatus(500);
    });

    $app->get('/history/{startDate}/{endDate}', function (Request $request, Response $response, array $args) {

        $userId = $request->getAttribute('userId');
        $startDate = $args['startDate'];
        $endDate = $args['endDate'];

        $entries = new Entries($this->db);
        $results = $entries->getHistory($userId, $startDate, $endDate);

        return $response->withJson($results);
    });

    $app->post('/newEntry', function (Request $request, Response $response, array $args) {

        $userId = $request->getAttribute('userId');
        $info = $request->getParam('info');
        $trailsList = $request->getParam('trails');

        $entries = new Entries($this->db);
        $results = $entries->newEntry($userId, $info, $trailsList);

        return $response->withJson($results);
    });

})->add($getTokenData);

$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function($req, $res) {
    return $res->withStatus(404);
});
