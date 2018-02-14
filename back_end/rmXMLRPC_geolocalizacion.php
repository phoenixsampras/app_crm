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

    // Lista de Geocerca
    case 'rmListaGeolocalizacionGeocerca':
      rmListaGeolocalizacionGeocerca($db);
    break;

    // Registrar Geocerca
    case 'rmRegistrarGeolocalizacionGeocerca':
      rmRegistrarGeolocalizacionGeocerca($data);
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

// Lista de geocercas
function rmListaGeolocalizacionGeocerca ($db) {
    try {
      $sql_geocerca = "
      SELECT
      rm_geocerca.id as geocerca_id,
      rm_geocerca.name as geocerca_name
      FROM rm_geocerca;
      ";

      $sql_geocerca_users = "
      SELECT
      rm_geocerca.id as geocerca_id,
      res_users.id as user_id,
      res_users.login
      FROM rm_geocerca
      INNER JOIN users_geocerca ON users_geocerca.rm_geocerca_id=rm_geocerca.id
      INNER JOIN res_users ON res_users.id=users_geocerca.res_users_id
      ORDER by rm_geocerca.id;
      ";

      $sql_geocerca_locations = "
      SELECT
      rm_geocerca.id as geocerca_id,
      rm_geocerca.name as geocerca_name
      ,rm_coordenadas_geocerca.rm_longitude
      ,rm_coordenadas_geocerca.rm_latitude
      FROM rm_geocerca
      INNER JOIN rm_coordenadas_geocerca ON rm_coordenadas_geocerca.geocerca_id=rm_geocerca.id
      ORDER by geocerca_id;
      ";

      $query = pg_query($db, $sql_geocerca);
      if(!$query){
        echo "Error".pg_last_error($db);
      exit;
      }
      $resultado1 = pg_fetch_all($query);

      $query2 = pg_query($db, $sql_geocerca_users);
      if(!$query2){
        echo "Error".pg_last_error($db);
      exit;
      }
      $resultado2 = pg_fetch_all($query2);

      $query3 = pg_query($db, $sql_geocerca_locations);
      if(!$query3){
        echo "Error".pg_last_error($db);
      exit;
      }
      $resultado3 = pg_fetch_all($query3);

      // print_r($resultado3);
      // print_r($resultado2);
      // print_r($resultado3);

      for ($i = 0; $i < count($resultado1); $i++) {
        $users = array();
        for ($z = 0; $z < count($resultado2); $z++) {
          if ($resultado1[$i]['geocerca_id'] == $resultado2[$z]['geocerca_id']) {
            $users[] = array('id'=>$resultado2[$z]['user_id'] ,'login'=>$resultado2[$z]['login']);
          }
        }

        $locations = array();
        for ($y = 0; $y < count($resultado3); $y++) {
          if ($resultado1[$i]['geocerca_id'] == $resultado3[$y]['geocerca_id']) {
            $locations[] = array('rm_longitude'=>$resultado3[$y]['rm_longitude'] ,'rm_latitude'=>$resultado3[$y]['rm_latitude']);
          }
        }

        $geofences[] =
          array(
            'geofence'=>array(
              'id'=>$resultado1[$i]['geocerca_id'],
              'name'=>$resultado1[$i]['geocerca_name'],
              'users'=>$users,
              'locations'=>$locations
            )
          );
      }


      echo $_GET['callback'].'({"rmListaGeolocalizacionGeocerca333": ' . json_encode($geofences) . '})';
      pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

// Geocerca
function rmRegistrarGeolocalizacionGeocerca($conex, $user_id) {
  $url = $conex['url'];
  $db = $conex['db'];
  $username = $conex['username'];
  $password = $conex['password'];

  $datosGeolocalizacion =
  array(
    array(
      'res_user_id' => intval($_REQUEST['res_user_id']),
      'rm_bearing' => ($_REQUEST['rm_bearing']),
      'rm_longitude' => ($_REQUEST['longitude']),
      'rm_latitude' => ($_REQUEST['latitude']),
    )
  );

  // $uid = login($conex);
  // $models = ripcord::client("$url/xmlrpc/2/object");
  // $id = $models->execute_kw($db, $uid, $password, 'rm.geolocalizacion', 'create', $datosGeolocalizacion);
  echo $_GET['callback'].'({"status":"success"})';

  // if (Is_Numeric ($id)) {
  //   echo $_GET['callback'].'({"rmRegistrarGeolocalizacion": '. $id . '})';
  // } else {
  //   print_r($_REQUEST);
  //   print_r($datosGeolocalizacion);
  //   print_r($id);
  // }
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
      'rm_bearing' => ($_REQUEST['rm_bearing']),
      'rm_longitude' => ($_REQUEST['longitude']),
      'rm_latitude' => ($_REQUEST['latitude']),
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
        --SELECT DISTINCT ON (login)
        SELECT
        res_users.id as user_id,
        res_users.login,
        --geoLive.id,
        --geoLive.res_user_id,
        geoLive.rm_longitude,
        geoLive.rm_latitude,
        geoLive.rm_bearing,
        --geoLive.create_uid,
        geoLive.create_date
        --geoLive.write_uid,
        --geoLive.write_date
        FROM
        public.rm_geolocalizacion_live AS geoLive
        INNER JOIN res_users ON res_users.id = geoLive.res_user_id
        WHERE DATE_PART('Day',now() - geoLive.create_date::timestamptz) < 1
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
      'rm_bearing' => ($_REQUEST['rm_bearing']),
      'rm_longitude' => ($_REQUEST['longitude']),
      'rm_latitude' => ($_REQUEST['latitude']),
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
