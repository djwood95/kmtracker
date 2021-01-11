<?php

class Entries extends Mapper {

    public function getHistory($userId, $startDate, $endDate) {
        $startDate = date("Y-m-d", strtotime($startDate));
        $endDate = date("Y-m-d", strtotime($endDate));

        $stmt = $this->db->prepare("SELECT SUM(e.distance) as distance,
                                           (e.system) as `system`, 
                                           (e.date) as `date`, 
                                           (e.type) as technique, 
                                           (e.comments) as comments,
                                           e.entryId
                                    FROM entries e
                                    JOIN users u ON u.username = e.username
                                    WHERE e.date>=:startDate AND e.date<=:endDate AND u.id=:userId
                                    GROUP BY e.entryId ORDER BY `date` ASC");
        $stmt->execute([
            'startDate' => $startDate,
            'endDate' => $endDate,
            'userId' => $userId
        ]);

        return $stmt->fetchAll();
    }

    public function newEntry($userId, $info, $trailsList) {

        //Get last entryId
        $stmt = $this->db->prepare("SELECT entryID FROM entries ORDER BY entryId DESC LIMIT 1");
        $stmt->execute();
        while($row = $stmt->fetch()) {
            $entryId = $row['entryID']+1;
        }

        //Get username
        $username = self::getUsername($userId);

        $stmt = $this->db->prepare("INSERT INTO entries (trail,distance,username,`system`,`date`,comments,`type`, entryID, timestamp2)
                                    VALUES (:trail, :distance, :username, :system, :date, :comments, :type, :entryId, '')");

        foreach ($trailsList as $trail) {
            $stmt->execute([
                'trail' => $trail['name'],
                'distance' => $trail['distance'],
                'username' => $username,
                'system' => $info['system'],
                'date' => $info['date'],
                'comments' => $info['comments'],
                'type' => $info['technique'],
                'entryId' => $entryId
            ]);
        }
    }

    public function editEntry($userId, $info, $trailsList, $entryId) {

        //Delete old entry
        self::deleteEntry($userId, $entryId);

        //Insert updated entry like normal
        self::newEntry($userId, $info, $trailsList);

    }

    public function deleteEntry($userId, $entryId) {

        $username = self::getUsername($userId);

        $stmt = $this->db->prepare("DELETE FROM entries WHERE username=:username AND entryID=:entryId");
        $stmt->execute([
            'username' => $username,
            'entryId' => $entryId
        ]);
    }

    private function getUsername($userId) {
        //Get username
        $stmt = $this->db->prepare("SELECT username FROM users WHERE id=:userId");
        $stmt->execute(['userId' => $userId]);
        while($row = $stmt->fetch()) {
            $username = $row['username'];
        }

        return $username;
    }

    public function loadEntry($userId, $entryId) {
        $username = self::getUsername($userId);
        $stmt = $this->db->prepare("SELECT * FROM entries WHERE username=:username AND entryId=:entryId");
        $stmt->execute([
            'username' => $username,
            'entryId' => $entryId
        ]);

        while($row = $stmt->fetch()) {
            $date = $row['date'];
            $system = $row['system'];
            $technique = $row['type'];
            $comments = $row['comments'];

            $trailsList[] = [
                'name' => $row['trail'],
                'distance' => $row['distance']
            ];
        }

        $results = [
            'date' => $date,
            'system' => $system,
            'technique' => $technique,
            'comments' => $comments,
            'trailsList' => $trailsList
        ];

        return $results;
    }

}

?>