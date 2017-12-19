<?php
header("Content-Type: text/javascript");
error_reporting(1);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');
require_once('rmFunciones.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

    case 'rmRutaDiaria':
      rmRutaDiaria($data);
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

function rmRutaDiaria_nosirve($db) {
    try {
        $pedido = $_REQUEST['res_user_id'];
        $sql = "
        SELECT
        rp.id,
        rp.name,
        rp.rm_latitude,
        rp.rm_longitude,
        rp.street,
        rp.phone,
        rp.mobile,
        'Mon' as day_of_week
        FROM
        public.res_partner AS rp
        --Limit  20

        WHERE rp.customer = true AND res_users.id = $pedido
        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"rmRutaDiaria": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmRutaDiaria($conex, $user_id) {
  try {
    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    $user_id = intval($_REQUEST['res_user_id']);

    $filtroCliente =
    array(
      array(
        array(
          'user_id','=',$user_id
        )
      )
    );

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");
    $rmListaClientes = $models->execute_kw($db, $uid, $password,
        'res.partner', 'search_read', $filtroCliente,
        array('fields'=>array(
        'id',
        'name',
        'street',
        'phone',
        'mobile',
        'rm_longitude',
        'rm_latitude',
        'user_id',
        'razon_social',
        'rm_dias_semana'
        ), 'limit'=>10000));

    if (count($rmListaClientes)>0) {
      echo $_GET['callback'].'({"rmListaClientes": ' . json_encode(utf8_converter($rmListaClientes)) . '})';
    } else {
      echo $_GET['callback'].'({"rmListaClientes": "false"})';
    }
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
