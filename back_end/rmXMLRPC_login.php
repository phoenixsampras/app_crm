<?php
header("Content-Type: text/javascript");
error_reporting(0);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

    case 'login':
        login($data);
    break;
    case 'loginApp':
        loginApp($data);
    break;

    default:
        echo "What are you doing here?";

}

function login($conex){


    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    $common = ripcord::client("$url/xmlrpc/2/common");

    // Autenticarse
    return $common->authenticate($db, $username, $password, array());
}

function loginApp($conex){
    $url = $conex['url'];
    $db = $conex['db'];
    $username = $_REQUEST['username'];
    $password = $_REQUEST['password'];

    if ($username && $password){
        $common = ripcord::client("$url/xmlrpc/2/common");
        $uid = $common->authenticate($db, $username, $password, array());
        // echo "usuario: </br>" . $uid;
        // Autenticarse
        if ($uid){
            // $uid = login($conex);
            $models = ripcord::client("$url/xmlrpc/2/object");
            $rmDatosUsuario = $models->execute_kw($db, $uid, $password, 'res.users', 'search_read', array(array(array('id', '=', $uid))), array('fields'=>array('ew_vendedor', 'partner_id'), 'limit'=>5));
            $partner_id = $rmDatosUsuario[0]['partner_id'][0];
            $ew_vendedor = $rmDatosUsuario[0]['ew_vendedor'][0];
            // echo "/n rmDatosUsuario:" .  $partner_id;
            // print_r($rmDatosUsuario);

            // Si es vendedor
            if ($ew_vendedor) {
                echo $_GET['callback'].'({"login": '.$uid.',"vendedor":"' . $rmDatosUsuario[0]['ew_vendedor'][1] . '","ciudad":false,"partner_id":0})';

            // Si es Cliente
            } else {
                $rmDatosCliente = $models->execute_kw($db, $uid, $password, 'res.partner', 'search_read', array(array(array('id', '=', $partner_id))), array('fields'=>array('ew_zonas_cliente_id'), 'limit'=>5));
                // echo "/n rmDatosCliente:";
                // print_r($rmDatosCliente);
                echo $_GET['callback'].'({"login": '.$uid.',"vendedor":"false","ciudad":"' . $rmDatosCliente[0]['ew_zonas_cliente_id'][1] . '", "partner_id": '. $rmDatosCliente[0]['id'] .'})';
            }
            // print_r($rmDatosUsuario);

        } else {
            echo $_GET['callback'].'({"login": "False"})';
        }
        // return $common->authenticate($db, $username, $password, array());
    }else {
        echo $_GET['callback'].'({"login": "NULL"})';
    }
}

?>
