<?php
header("Content-Type: text/javascript");
error_reporting(1);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

    case 'rmListaGeolocalizacion':
      rmListaGeolocalizacion($db);
    break;

    case 'rmRegistrarGeolocalizacion':
      rmRegistrarGeolocalizacion($data);
    break;

    case 'rmListaGeolocalizacionLive':
    rmListaGeolocalizacionLive($db);
    break;

    case 'rmRegistrarGeolocalizacionLive':
      rmRegistrarGeolocalizacionLive($data);
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

function rmListaGeolocalizacion ($db) {
    try {
        $sql = "SELECT * FROM rm_geolocalizacion ORDER by id;";
        $query = pg_query($db, $sql);
        if(!$query){
          echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);
        echo $_GET['callback'].'({"rmListaGeolocalizacion": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmRegistrarGeolocalizacion($conex, $user_id) {
  $url = $conex['url'];
  $db = $conex['db'];
  $username = $conex['username'];
  $password = $conex['password'];

  $datosGeolocalizacion =
  array(
    array(
      'res_user_id' => intval($_REQUEST['res_user_id']),
      // 'res_user_id' => 6,
      'rm_longitude' => intval($_REQUEST['longitude']),
      'rm_latitude' => intval($_REQUEST['latitude']),
    )
  );

  $uid = login($conex);
  $models = ripcord::client("$url/xmlrpc/2/object");
  $id = $models->execute_kw($db, $uid, $password, 'rm.geolocalizacion', 'create', $datosGeolocalizacion);

  if (Is_Numeric ($id)) {
    echo $_GET['callback'].'({"rmRegistrarGeolocalizacion": '. $id . '})';
  } else {
    print_r($_REQUEST);
    print_r($datosGeolocalizacion);
    print_r($id);
  }
}

function rmListaGeolocalizacionLive ($db) {
    try {
        $sql = "
        SELECT DISTINCT ON (login)
        res_users.id as user_id,
        res_users.login,
        --geoLive.id,
        --geoLive.res_user_id,
        geoLive.rm_longitude,
        geoLive.rm_latitude,
        --geoLive.create_uid,
        geoLive.create_date
        --geoLive.write_uid,
        --geoLive.write_date
        FROM
        public.rm_geolocalizacion_live AS geoLive
        INNER JOIN res_users ON res_users.id = geoLive.res_user_id
        ORDER BY res_users.login, geoLive.create_date DESC;

        ";
        $query = pg_query($db, $sql);
        if(!$query){
          echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);
        echo $_GET['callback'].'({"rmListaGeolocalizacionLive": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmRegistrarGeolocalizacionLive($conex, $user_id) {
  $url = $conex['url'];
  $db = $conex['db'];
  $username = $conex['username'];
  $password = $conex['password'];

  $datosGeolocalizacionLive =
  array(
    array(
      'res_user_id' => intval($_REQUEST['res_user_id']),
      // 'res_user_id' => 6,
      'rm_longitude' => intval($_REQUEST['longitude']),
      'rm_latitude' => intval($_REQUEST['latitude']),
    )
  );

  $uid = login($conex);
  $models = ripcord::client("$url/xmlrpc/2/object");
  $id = $models->execute_kw($db, $uid, $password, 'rm.geolocalizacion.live', 'create', $datosGeolocalizacionLive);

  if (Is_Numeric ($id)) {
    echo $_GET['callback'].'({"rmRegistrarGeolocalizacionLive": '. $id . '})';
  } else {
    print_r($_REQUEST);
    print_r($datosGeolocalizacionLive);
    print_r($id);
  }
}

?>
