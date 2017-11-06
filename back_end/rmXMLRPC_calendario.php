<?php
header("Content-Type: text/javascript");
error_reporting(1);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

    case 'rmListaEventos':
      rmListaEventos($db);
    break;

    case 'rmRegistrarPedido':
      rmRegistrarPedido($data);
    break;

    case 'rmRegistrarGeolocalizacion':
      rmRegistrarGeolocalizacion($db);
    break;

    default:
        echo "What are you doing here?";

}

function login($conex){

    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    $common = ripcord::client("$url/xmlrpc/2/common");

    // Autenticarse
    return $common->authenticate($db, $username, $password, array());
}

function rmListaEventos($db) {
    try {
        $pedido = $_REQUEST['id'];
        $sql = "
        SELECT
        public.calendar_event.name,
        public.res_partner.name AS customer,
        public.calendar_event.description,
        public.calendar_event.start as start_datetime,
        public.calendar_event.stop as end_datetime,
        public.calendar_event.duration
        FROM
        public.calendar_event
        LEFT JOIN public.calendar_event_res_partner_rel ON public.calendar_event_res_partner_rel.calendar_event_id = public.calendar_event.id
        LEFT JOIN public.res_partner ON public.res_partner.id = public.calendar_event_res_partner_rel.res_partner_id
        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"rmListaEventos": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmRegistrarGeolocalizacion($db) {

  try {
      $res_user_id = $_REQUEST['res_user_id'];
      $longitude = $_REQUEST['longitude'];
      $latitude = $_REQUEST['latitude'];
      $sql = "
        INSERT INTO rm_geolocation (res_user_id, longitude, latitude) VALUES ($res_user_id,$longitude,$latitude) RETURNING id
          ";

      $query = pg_query($db, $sql);
      if(!$query){
      echo "Error".pg_last_error($db);
      exit;
      }

      $resultado = pg_fetch_all($query);

      echo $_GET['callback'].'({"rmRegistrarGeolocalizacion": ' . json_encode($resultado) . '})';
      pg_close($db);

  } catch(PDOException $e) {
      echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
      exit;
  }
}

?>
