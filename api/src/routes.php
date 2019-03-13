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
        return $response->withStatus(500);
    } else {
        return $response->withStatus(201)
                        ->withJson($loggedInResponse);
    }
});

$app->post('/test', function (Request $request, Response $response, array $args) {
    return $response->withJson("success");
});

$app->post('/trackPageLoad', function (Request $request, Response $response, array $args) {
    $toPage = $request->getParam('toPage');
    $fromPage = $request->getParam('fromPage');
    $loggedIn = $request->getParam('loggedIn');
    $deviceWidth = $request->getParam('deviceWidth');
    $deviceHeight = $request->getParam('deviceHeight');

    $userId = 0;

    $util = new Util($this->db);
    $r1 = $util->trackPageLoad($userId, $toPage, $fromPage, $deviceWidth, $deviceHeight);
    return $response->withJson($r1);
});

$app->get('/leaderboard', function (Request $request, Response $response, array $args) {

    $main = new Main($this->db);
    $results = $main->getLeaderboardDefault();

    return $response->withHeader('Content-Type', 'application/json')->withJson($results, null, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
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

    if($results) return $response->withStatus(200);
    else return $response->withStatus(500);
});

$app->get('/getTrailSystems', function (Request $request, Response $response, array $args) {

    $main = new Main($this->db);
    $results = $main->getTrailSystems();

    return $response->withJson($results);

    //if($results) return $response->withStatus(200);
    //else return $response->withStatus(500);
});

$app->post('/resetPass/checkEmail', function (Request $request, Response $response, array $args) {

    $username = $request->getParam('username');
    $email = $request->getParam('email');

    $util = new Util($this->db);
    $results = $util->resetPassCheckEmail($username, $email);

    if(!$results) return $response->withStatus(500);
    else return $response->withJson($results);
});

$app->post('/resetPass/checkCode', function (Request $request, Response $response, array $args) {

    $userId = $request->getParam('userId');
    $code = $request->getParam('code');

    $util = new Util($this->db);
    $results = $util->resetPassCheckCode($userId, $code);

    if(!$results) return $response->withStatus(500);
    else return $response->withStatus(200);
});

$app->post('/resetPass/saveNewPass', function (Request $request, Response $response, array $args) {
    $userId = $request->getParam('userId');
    $newPass = $request->getParam('newPass');

    $util = new Util($this->db);
    $results = $util->saveNewPass($userId, $newPass);
    if($results) return $response->withStatus(200);
    else return $response->withStatus(500);

});


/* API/Protected Routes */
$app->group('/api', function() use ($app) {

    // test login - if token is invalid, middleware will return 401 error
    $app->get('/testLogin', function (Request $request, Response $response, array $args) {
        $userId = $request->getAttribute('userId');

        return $response;
    });

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

    $app->post('/editEntry', function (Request $request, Response $response, array $args) {

        $userId = $request->getAttribute('userId');
        $info = $request->getParam('info');
        $trailsList = $request->getParam('trails');
        $entryId = $request->getParam('entryId');

        $entries = new Entries($this->db);
        $results = $entries->editEntry($userId, $info, $trailsList, $entryId);

        return $response->withJson($results);
    });

    $app->get('/deleteEntry/{entryId}', function (Request $request, Response $response, array $args) {

        $userId = $request->getAttribute('userId');
        $entryId = $args['entryId'];

        $entries = new Entries($this->db);
        $results = $entries->deleteEntry($userId, $entryId);

        return $response->withJson($results);
    });

    $app->get('/loadEntry/{entryId}', function (Request $request, Response $response, array $args) {

        $userId = $request->getAttribute('userId');
        $entryId = $args['entryId'];

        $entries = new Entries($this->db);
        $results = $entries->loadEntry($userId, $entryId);

        return $response->withJson($results);
    });

})->add($getTokenData);

$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function($req, $res) {
    return $res->withStatus(404);
});
