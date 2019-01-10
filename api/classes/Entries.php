<?php

class Entries extends Mapper {

    public function getHistory($userId, $startDate, $endDate) {
        $startDate = date("Y-m-d", strtotime($startDate));
        $endDate = date("Y-m-d", strtotime($endDate));

        $stmt = $this->db->prepare("SELECT SUM(e.distance) as distance,
                                           ANY_VALUE(e.system) as `system`, 
                                           ANY_VALUE(e.date) as `date`, 
                                           ANY_VALUE(e.type) as technique, 
                                           ANY_VALUE(e.comments) as comments
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
        $stmt = $this->db->prepare("SELECT entryId FROM entries ORDER BY entryId DESC LIMIT 1");
        $stmt->execute();
        while($row = $stmt->fetch()) {
            $entryId = $row['entryId']+1;
        }

        //Get username
        $stmt = $this->db->prepare("SELECT username FROM users WHERE id=:userId");
        $stmt->execute(['userId' => $userId]);
        while($row = $stmt->fetch()) {
            $username = $row['username'];
        }

        $stmt = $this->db->prepare("INSERT INTO entries (trail,distance,username,system,date,comments,type, entryId)
                                    VALUES (:trail, :distance, :username, :system, :date, :comments, :type, :entryId)");

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

}

?>