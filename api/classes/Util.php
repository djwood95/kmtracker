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
		//$usernameList = self::getUsernameList();
		//if(in_array($info->username, $usernameList)) return false;

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


}