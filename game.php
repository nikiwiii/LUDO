<?php
include("operations.php");
session_start();
date_default_timezone_set("America/New_York");
$conn = mysqli_connect("mysql.ct8.pl", "m38795_dygsow", "zaq1@WSX", "m38795_ludo");
//columns: id
// players
// scores
// player_count
// begun
// ready_plrs
// won
// date
// thrown

if(!$conn) {
    echo "nie pyklo";
} else {
    $operation = new Operations();
    switch ($_GET["query"]) {
        case 'setthrow':
            $operation->thrown();
            break;
        case 'setvote':
            $operation->setVote();
            break;
        case 'setlogin':
            $operation->login();
            break;
        case 'reset':
            $operation->resetBase();
            break;
        case 'setmoved':
            $operation->moved();
            break;
        case 'getscores':
            $operation->scores();
            break;
        case 'getplayers':
            $operation->players();
            break;
        case 'setwon':
            $operation->won();
            break;
        case 'getdate':
            $operation->getMoveDate();
            break;
        case 'getcurr':
            $operation->getCurrDate();
            break;
        case 'getthrown':
            $operation->getThrown();
            break;
        case 'checksession':
            $operation->checkSession();
            break;
        
        default:
            break;
    }
}
mysqli_close($conn);