<?php

class Operations
{
    public function thrown() {
        global $conn;
        $id = htmlspecialchars($_GET["id"]);
        $rand = rand(1, 6);
        echo $rand;
        mysqli_query($conn, "UPDATE game SET thrown = $rand WHERE id = $id");
    }

    public function getThrown() {
        global $conn;
        $id = htmlspecialchars($_GET["id"]);
        $query = mysqli_query($conn, "SELECT thrown FROM game WHERE id = $id");
        while($row = mysqli_fetch_row($query)) {
            $cube = $row[0];
        }
        echo $cube;
    } 

    public function setVote() {
        global $conn;
        $color = htmlspecialchars($_GET["color"]);
        $id = htmlspecialchars($_GET["id"]);
        $query = mysqli_query($conn, "SELECT ready_plrs, player_count, players FROM game WHERE id = $id");
        while ($row = mysqli_fetch_row($query)) {
            $readys = $row[0];
            $players = $row[1];
            $str = $row[2];
        }
        $json = json_decode($str, true);
        if (htmlspecialchars($_GET["vote"]) == "add") {
            $readys += 1;
            $json[$color] = substr($json[$color], 0, -1)."1";
            if ($readys == $players && $players >= 2) {
                $date = date('Y-m-d H:i:s');
                echo $date;
                mysqli_query($conn, "UPDATE game SET begun = 1, date = '$date' WHERE id = $id");
            }
        } else {
            $readys -= 1;
            $json[$color] = substr($json[$color], 0, -1)."0";
        }
        mysqli_query($conn, "UPDATE game SET players = '".json_encode($json)."', ready_plrs = $readys WHERE id = $id");
    } 

    public function login() {
        global $conn;
        $nick = htmlspecialchars($_GET["login"]);
        $message = "";
        if (isset($_SESSION["nick"])) {
            $message = "YOU WERE ALREADY LOGGED AS ".$nick;
        } else {
            $_SESSION["nick"] = $nick;
        }
        $query = mysqli_query($conn, "SELECT players, id, begun, player_count FROM game");
        $colors = ["red", "blue", "green", "yellow"];
        $found = false;
        $id = 0;
        while($row = mysqli_fetch_row($query)) {//iteruj przez pokoje
            if (!$found){
                $players = $row[0];
                $id = $row[1];
                $begun = $row[2];
                $count = $row[3];
                if (str_contains($players, '"'.$nick.'0"') || str_contains($players, '"'.$nick.'1"')) {
                    $found = true;
                    $nicks = json_decode($players, true);
                    $arr = [
                        "nick" => $nick,
                        "color" => array_search($nick."0", $nicks),
                        "id" => $id,
                        "msg" => $message
                    ];
                    if(!$arr["color"]) {
                        $arr["color"] = array_search($nick."1", $nicks);
                    }
                    echo json_encode($arr);
                } else if ($count < 4 && $begun == 0) {
                    $found = true;
                    if ($count == 3) {
                        $date = date('Y-m-d H:i:s');
                        mysqli_query($conn, "UPDATE game SET begun = 1, date = '$date' WHERE id = $id");
                    }
                    $arr = [
                        "nick" => $nick,
                        "color" => $colors[$count],
                        "id" => $id,
                        "msg" => $message
                    ];
                    echo json_encode($arr);
                    $json = json_decode($players, true);
                    $json[$arr["color"]] = $nick."0";
                    mysqli_query($conn, "UPDATE game SET players = '".json_encode($json)."', player_count = ".($count + 1)." WHERE id = $id");
                }
            }
        }
        if (!$found) {//stworz nowy pokoj
            $id += 1;
            mysqli_query($conn, "INSERT INTO game(id) VALUES ($id)");
            $arr = [
                "nick" => $nick,
                "color" => $colors[0],
                "id" => $id,
                "msg" => $message
            ];
            echo json_encode($arr);
            $json = [];
            $json[$arr["color"]] = $nick."0";
            mysqli_query($conn, "UPDATE game SET players = '".json_encode($json)."', player_count = 1 WHERE id = $id");
        }
    
    } 

    public function resetBase() {
        global $conn;
        mysqli_query($conn, "TRUNCATE game");
    } 

    public function moved() {
        global $conn;
        $id = htmlspecialchars($_GET["id"]);
        $entityBody = file_get_contents('php://input');
        $date = date('Y-m-d H:i:s');
        mysqli_query($conn, "UPDATE game SET scores = '$entityBody', date = '$date' WHERE id = $id");
    } 

    public function scores() {
        global $conn;
        $id = htmlspecialchars($_GET["id"]);
        $query = mysqli_query($conn, "SELECT scores, won FROM game WHERE id = $id");
        while($row = mysqli_fetch_row($query)) {
            $scores = $row[0];
            $won = $row[1];
        }
        echo $scores."|".$won;
    } 

    public function players() {
        global $conn;
        $id = htmlspecialchars($_GET["id"]);
        $query = mysqli_query($conn, "SELECT players, begun FROM game WHERE id = $id");
        $players = "";
        $begun = "";
        while($row = mysqli_fetch_row($query)) {
            $players = $row[0];
            $begun = $row[1];
        }
        echo $players."|".$begun;
    } 

    public function won() {
        global $conn;
        $id = htmlspecialchars($_GET["id"]);
        $who = htmlspecialchars($_GET["won"]);
        mysqli_query($conn, "UPDATE game SET won = '$who' WHERE id = $id");
    } 

    public function getMoveDate() {
        global $conn;
        $id = htmlspecialchars($_GET["id"]);
        $query = mysqli_query($conn, "SELECT date FROM game WHERE id = $id");
        while($row = mysqli_fetch_row($query)) {
            $date = $row[0];
        }
        echo $date;
    } 

    public function getCurrDate() {
        echo date('Y-m-d H:i:s');
    }

    public function checkSession() {
        if (isset($_SESSION["nick"])) {
            echo $_SESSION["nick"];
        } else { echo ""; }
    }
}