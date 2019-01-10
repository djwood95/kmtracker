<?php
abstract class Mapper {
    protected $db;
    protected $seasonStart;
    protected $seasonEnd;
    public function __construct($db) {

        date_default_timezone_set("America/Detroit");

        //If in October, November, or December, start date is Nov 1 of current year
        //and end date is June 1 of next year
        $currentMonth = date("m");
        $currentYear = date("Y");
        $nextYear = date("Y") + 1;
        $lastYear = date("Y") - 1;
        if($currentMonth >= 10){
            $this->seasonStart = date("Y-m-d", strtotime("november 1, $currentYear"));
            $this->seasonEnd = date("Y-m-d", strtotime("June 1, $nextYear"));

        //If month is Jan, Feb, March, April, thru the summer, use nov 1 of last year
        //and end date is June 1 of current year
        }else{
            $this->seasonStart = date("Y-m-d", strtotime("november 1, $lastYear"));
            $this->seasonEnd = date("Y-m-d", strtotime("june 1, $currentYear"));
        }

        $this->db = $db;
    }
}

?>