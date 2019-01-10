<?php

class Main extends Mapper {

    public function getLeaderboard($startDate, $endDate) {
        $stmt = $this->db->prepare("SELECT SUM(e.distance) as kms, e.username, MAX(e.date) as lastUpdate,
                                        (SELECT colorgroup FROM users WHERE username=e.username LIMIT 1) as colorgroup
                                    FROM entries e
                                    WHERE e.date>=:startDate AND e.date<=:endDate
                                    GROUP BY e.username
                                    ORDER BY kms DESC");
        $stmt->execute([
            'startDate' => date("Y-m-d", strtotime($startDate)),
            'endDate' => date("Y-m-d", strtotime($endDate))
        ]);
        
        $i = 1;
        $total = 0;
        while($row = $stmt->fetch()) {
            $result = $row;
            $result['lastUpdate'] = date("n/j", strtotime($row['lastUpdate']));
            $result['place'] = $i;
            $results['list'][] = $result;
            $i++;
            $total += $row['kms'];
        }

        $results['total'] = number_format($total, 1);

        return $results;
    }

    public function getLeaderboardDefault() {
        $results = self::getLeaderboard($this->seasonStart, $this->seasonEnd);
        $results['startDate'] = $this->seasonStart;
        $results['endDate'] = $this->seasonEnd;

        return $results;
    }

    public function groupStandings() {
        
        $stmt = $this->db->prepare("SELECT SUM(e.distance) as kms, u.colorgroup
                                    FROM entries e
                                    JOIN users u ON u.username = e.username
                                    WHERE e.date>=:startDate AND e.date<=:endDate
                                    GROUP BY u.colorgroup
                                    ORDER BY kms DESC");
                                    
        $stmt->execute([
            'startDate' => $this->seasonStart,
            'endDate' => $this->seasonEnd
        ]);
        
        $i = 1;
        while($row = $stmt->fetch()) {
            $res = $row;
            $res['place'] = $i;
            $results['list'][] = $res;
            $i++;
        }
    
        return $results;
    }

    public function lifetime() {
        $stmt = $this->db->prepare("SELECT SUM(e.distance) as kms, e.username,
                                        (SELECT colorgroup FROM users WHERE username=e.username LIMIT 1) as colorgroup
                                    FROM entries e
                                    GROUP BY e.username
                                    ORDER BY kms DESC");

        $stmt->execute();

        $i = 1;
        $results = [];
        while($row = $stmt->fetch()) {
            $result = $row;
            $result['lastUpdate'] = self::calcSeasons($row['username']);
            $result['place'] = $i;
            $results['list'][] = $result;
            $i++;
        }

        return $results;
    }

    public function allSeasons() {

        //create list of all possible seasons
        $startYear = 2013;
        while($startYear <= $this->seasonStart){
            $endYear = $startYear + 1;
            $seasons[] = "$startYear-$endYear";
            $startYear++;
        }

        //create a list of distances within each season
        $results = [];
        foreach($seasons as $season) {
            $startYear = explode("-", $season)[0];
            $endYear = explode("-", $season)[1];
            $startDate = "$startYear-09-01";
            $endDate = "$endYear-06-01";

            $stmt = $this->db->prepare("SELECT SUM(e.distance) as kms, e.username,
                                            (SELECT colorgroup FROM users WHERE username=e.username LIMIT 1) as colorgroup
                                        FROM entries e
                                        WHERE e.date>=:startDate AND e.date<=:endDate
                                        GROUP BY e.username HAVING kms > 0
                                        ORDER BY kms DESC");

            $stmt->execute([
                'startDate' => $startDate,
                'endDate' => $endDate
            ]);

            while($row = $stmt->fetch()) {
                $result = $row;
                $result['lastUpdate'] = $season;
                $results[] = $result;
            }
        }

        //sort the resulting list by total kms
        array_multisort( array_column($results, "kms"), SORT_DESC, $results );

        //add 'place' column
        $i = 0;
        foreach($results as $row) {
            $place = $i + 1;
            $results[$i]['place'] = $place;
            $i++;
        }

        $results2['list'] = $results;

        return $results2;
    }

    private function calcSeasons($username) {
        $stmt = $this->db->prepare("SELECT username, MIN(date) as startDate, MAX(date) as endDate
                                    FROM entries e WHERE username=:username");
        $stmt->execute(['username' => $username]);

        while($row = $stmt->fetch()) {
            $startDate = $row['startDate'];
            $endDate = $row['endDate'];
        }

        $startYear = date("Y", strtotime($startDate));
        $endYear = date("Y", strtotime($endDate));

        if($startYear == $endYear) return $startYear;

        return "$startYear - $endYear";
    }

    public function getTrailSystems() {
        $stmt = $this->db->prepare("SELECT DISTINCT `system` from entries");
        $stmt->execute();

        $results = [];
        while($row = $stmt->fetch()) {
            $results[] = $row['system'];
        }

        return $results;
    }

}

?>