<?php

use Firebase\JWT\JWT;
use Tuupola\Base62;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Util extends Mapper {
	
	/**
	 * Checks if username/password is valid, creates access token
	 * @param  String username, String password
	 * @return boolean
	 */
	public function checkLogin($email, $password) {
        $password_oldHash = hash('sha256', $password);
		$stmt = $this->db->prepare("SELECT id,username,password,password2 FROM users WHERE username=:email OR email=:email");
		$stmt->execute([
			'email' => $email
        ]);
		
		$count = 0;
		while($row = $stmt->fetch()) {
			if(password_verify($password, $row['password2'])){
				$count++;
				$token = self::createToken($row['id'], $row['username']);
			} elseif($row['password2'] == '' && $password_oldHash == $row['password']) {
                $count++;
                $token = self::createToken($row['id'], $row['username']);
                self::createNewPassword($row['id'], $password);
            }
            $username = $row['username'];
        }
        
		if($count == 1) {
			$response = ["success" => true, "token" => $token, "username" => $username];
		} else {
			$response = ["success" => false];
		}

		return $response;

	}

	private function createToken($userId, $username) {

		$now = new DateTime();
    	$future = new DateTime("now +2 hours");

		$jti = (new Base62)->encode(random_bytes(16));

		$payload = [
			"iat" => $now->getTimeStamp(),
			"exp" => $future->getTimeStamp(),
			"jti" => $jti,
			"userId" => $userId,
			"username" => $username
		];

		$secret = $_ENV['JWT_SECRET'];
		$token = JWT::encode($payload, $secret);

		$data["token"] = $token;
		$data["expires"] = $future->getTimeStamp();
		//$data["decoded"] = $decoded;

		return $data;
    }
    
    private function createNewPassword($userId, $password) {

        $stmt = $this->db->prepare("UPDATE users SET password2=:newPass, password='' WHERE id=:userId");
        $stmt->execute([
            'newPass' => password_hash($password, PASSWORD_DEFAULT),
            'userId' => $userId
        ]);

	}

	public function getUsernameList() {
		$stmt = $this->db->prepare("SELECT username FROM users");
		$stmt->execute();
		$results = [];

		while($row = $stmt->fetch()) {
			$results[] = $row['username'];
		}

		return $results;
	}
	
	public function newAccount($info) {

		//check for duplicate username
		$usernameList = self::getUsernameList();
		if(in_array($info['username'], $usernameList)) return false;

		//check that password is valid
		if(strlen($info['password1']) < 6 || strlen($info['password1']) > 100) return false;

		$stmt = $this->db->prepare("INSERT INTO users (username, password2, email, colorgroup)
									VALUES (:username, :pass, :email, :colorgroup)");

		$stmt->execute([
			'username' => $info['username'],
			'pass' => password_hash($info['password1'], PASSWORD_DEFAULT),
			'email' => $info['email'],
			'colorgroup' => $info['selectedGroup']
		]);

		return true;
	}

	public function getColorGroup($userId) {
		$stmt = $this->db->prepare("SELECT colorgroup FROM users WHERE id=:userId");
		$stmt->execute(['userId' => $userId]);

		return $stmt->fetch()['colorgroup'];
	}

	public function saveColorGroup($userId, $colorgroup) {
		$stmt = $this->db->prepare("UPDATE users SET colorgroup=:colorgroup WHERE id=:userId");
		$stmt->execute(['colorgroup' => $colorgroup, 'userId' => $userId]);

		return true;
	}

	public function saveNewPass($userId, $newPass) {

		//check pass length requirements
		if(strlen($newPass) < 6 || strlen($newPass) > 100) return false;

		$stmt = $this->db->prepare("UPDATE users SET password2=:newPass WHERE id=:userId");
		$stmt->execute([
			'newPass' => password_hash($newPass, PASSWORD_DEFAULT),
			'userId' => $userId
		]);

		return true;
	}

	public function trackPageLoad($userId, $toPage, $fromPage, $deviceWidth, $deviceHeight) {
		//return "$userId, $toPage, $fromPage, $deviceWidth, $deviceHeight";
		$stmt = $this->db->prepare("INSERT INTO activity (userId, toPage, fromPage, deviceWidth, deviceHeight)
									VALUES (:userId, :toPage, :fromPage, :deviceWidth, :deviceHeight)");

		$stmt->execute([
			'userId' => $userId,
			'toPage' => $toPage,
			'fromPage' => $fromPage,
			'deviceWidth' => $deviceWidth,
			'deviceHeight' => $deviceHeight
		]);
	}

	public function resetPassCheckEmail($username, $email) {

		//Check username/email combination
		$stmt = $this->db->prepare("SELECT * FROM users WHERE username=:username AND email=:email");
		$stmt->execute([
			'username' => $username,
			'email' => $email
		]);

		if($stmt->rowCount() != 1) return false;

		while($row = $stmt->fetch()) {
			$userId = $row['id'];
		}

		//delete existing passwordRecovery rows for this user
		$stmt = $this->db->prepare("DELETE FROM passwordRecovery WHERE userId=:userId");
		$stmt->execute(['userId' => $userId]);

		$code = substr(md5(rand()), 0, 7);
		$expires = date("Y-m-d H:i:s", strtotime("+1 hour"));

		//add new password recover info to database
		$stmt = $this->db->prepare("INSERT INTO passwordRecovery (userId, code, expires) VALUES (:userId, :code, :expires)");
		$stmt->execute([
			'userId' => $userId,
			'code' => $code,
			'expires' => $expires
		]);

		//send email with reset code
		$to = $email;
		$subject = "KM Tracker Password Reset";

		$message = "
		<html>
		<head>
		<title>KM Tracker Password Reset</title>
		</head>
		<body>
		Hello, $username<br/><br/>

		It appears that you have requested a password reset for <a href='https://kmtracker.org'>kmtracker.org</a>.
		If you requested this reset and would like to continue, you can use the code below:<br/><br/>

		<h4>$code</h4><br/>

		If you did not request the code, please <a href='https://kmtracker.org/resetPass/cancel/$code'>click here</a>
		to cancel the reset.

		</body>
		</html>
		";

		// Always set content-type when sending HTML email
		$headers = "MIME-Version: 1.0" . "\r\n";
		$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

		// More headers
		$headers .= 'From: <no-reply@kmtracker.org>' . "\r\n";

		mail($to,$subject,$message,$headers);

		return ['userId' => $userId];

	}


	public function resetPassCheckCode($userId, $code) {

		$curDate = date("Y-m-d H:i:s");

		$stmt = $this->db->prepare("SELECT * FROM passwordRecovery WHERE userId=:userId AND code=:code AND expires>=:curDate");
		$stmt->execute([
			'userId' => $userId,
			'code' => $code,
			'curDate' => $curDate
		]);

		return $stmt->rowCount() == 1;
	}


}