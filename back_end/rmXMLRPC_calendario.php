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

    case 'rmRegistrarEvento':
      rmRegistrarEvento($data);
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
        $res_user_id = $_REQUEST['res_user_id'];
        $sql = "
        SELECT
          calendar_event.name,
          res_partner.name AS customer,
          calendar_event.description,
          calendar_event.start AS start_datetime,
          calendar_event.stop AS end_datetime,
          calendar_event.duration,
          res_users.login as user,
          res_users.id as user_id,
          res_partner.rm_longitude AS rm_longitude,
          res_partner.rm_latitude AS rm_latitude,
          rm_calendar_event_estado.id AS estado_id,
          rm_calendar_event_estado.name AS estado
        FROM
          calendar_event
          LEFT JOIN calendar_event_res_partner_rel ON calendar_event_res_partner_rel.calendar_event_id = calendar_event.id
          LEFT JOIN res_partner ON res_partner.id = calendar_event_res_partner_rel.res_partner_id
          LEFT JOIN res_users ON calendar_event.user_id = res_users.id
          LEFT JOIN rm_calendar_event_estado ON calendar_event.rm_estado = rm_calendar_event_estado.id
        WHERE res_users.id = $res_user_id
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

function rmRegistrarEvento($conex) {

      $url = $conex['url'];
      $db = $conex['db'];
      $username = $conex['username'];
      $password = $conex['password'];
      // $username = 'gustavo@gmail.com';
      // $password = '123456';

      $res_user_id=intval($_REQUEST['res_user_id']);
      $name=$_REQUEST['name'];
      $partner_ids=$_REQUEST['partner_ids'];
      $duration=$_REQUEST['duration'];
      $description=$_REQUEST['description'];
      $start_datetime=$_REQUEST['start_datetime'];

      $datosEvento =
      array(
        array(
          'user_id' => $res_user_id,
          // 'write_id' => $res_user_id,
          // 'create_id' => $res_user_id,
          'name' => $name,
          'start_datetime' => $start_datetime,
          'start' => $start_datetime,
          'stop' => $start_datetime,
          // 'partner_ids' => $partner_ids,
          // 'duration' => $duration,
          // 'description' => $description,
        )
      );

      $uid = login($conex);
      $models = ripcord::client("$url/xmlrpc/2/object");
      $id = $models->execute_kw($db, $uid, $password, 'calendar.event', 'create', $datosEvento);

      if (Is_Numeric ($id)) {
        echo $_GET['callback'].'({"order_id": '. $id . '})';
      } else {
        print_r($_REQUEST);
        print_r($datosEvento);
        print_r($id);
      }
  }

?>
