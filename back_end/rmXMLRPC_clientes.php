<?php
header("Content-Type: text/javascript");
error_reporting(1);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

    case 'rmTipoCliente':
      rmTipoCliente($db);
    break;

    case 'rmListaClientes':
      rmListaClientes($data);
    break;

    case 'rmRegistrarCliente':
      rmRegistrarCliente($data);
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

function rmListaClientesNoSirve ($db) {
    try {
        $user_id = $_REQUEST['res_user_id'];
        $sql = "
          SELECT id,
            name as rm_nombre,
            street as rm_direccion,
            phone as rm_telefono,
            mobile as rm_celular,
            0 as rm_longitude,
            0 as rm_latitude,
            '' as photo_m,
            '' as photo_s,
            ('{CM,CG,CH}'::text[])[ceil(random()*3)] as tipo,
            user_id as res_user_id,
            rm_sync,
            rm_sync_date_time,
            rm_sync_operacion
          FROM res_partner
          WHERE user_id = " .$user_id . "
          ORDER by name


        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"rmListaClientes": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmListaClientes($conex, $user_id) {
  try {
    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    // $user_id = $_REQUEST['res_user_id'];

    // $id=intval($_REQUEST['id']);
    $user_id = intval($_REQUEST['res_user_id']);
    // $rmDateOrder=$_REQUEST['rmDateOrder'];
    // $rmNote=$_REQUEST['rmNote'];

    $datosCliente =
    array(
      array(
        'user_id','=',$user_id
        // 'date_order' => $rmDateOrder,
        // 'note' => $rmNote,
      )
    );

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");
    $rmListaClientes = $models->execute_kw($db, $uid, $password,
        'res.partner', 'search_read', array($datosCliente),
        array('fields'=>array(
        'id',
        'name',
        'street',
        'phone',
        'mobile',
        'rm_longitude',
        'rm_latitude',
        'property_product_pricelist',
        'user_id',
        'razon_social',
        'nit',
        'rm_sync',
        'rm_sync_date_time',
        'rm_sync_operacion'), 'limit'=>10000));

    echo $_GET['callback'].'({"rmListaClientes": ' . json_encode($rmListaClientes) . '})';
    //echo $_GET['callback'].'({"login": '.$uid.',"vendedor":"false","ciudad":"' . $rmDatosCliente[0]['ew_zonas_cliente_id'][1] . '", "partner_id": '. $rmDatosCliente[0]['id'] .'})';

  } catch(PDOException $e) {
      echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
      exit;
  }
}

function rmRegistrarCliente($conex, $user_id) {

    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    $id = intval($_REQUEST['id']);
    $name = $_REQUEST['name']  ? $_REQUEST['name'] : '';
    $street = $_REQUEST['street'] ? $_REQUEST['street']: '';
    $phone = $_REQUEST['phone'] ? $_REQUEST['phone']: '';
    $mobile = $_REQUEST['mobile'] ? $_REQUEST['mobile']: '';
    $rm_longitude = $_REQUEST['rm_longitude'] ? $_REQUEST['rm_longitude']: '';
    $rm_latitude = $_REQUEST['rm_latitude'] ? $_REQUEST['rm_latitude']: '';
    $property_product_pricelist = $_REQUEST['property_product_pricelist'] ? $_REQUEST['property_product_pricelist']: '';
    $user_id = intval($_REQUEST['user_id']) ? intval($_REQUEST['user_id']) : 0;
    $razon_social = $_REQUEST['razon_social'] ? $_REQUEST['razon_social'] : 'Ninguno';
    $nit = $_REQUEST['nit'] ? $_REQUEST['nit'] : '0';
    $rm_sync_date_time = $_REQUEST['rm_sync_date_time'] ? $_REQUEST['rm_sync_date_time'] : date('Y-m-d H:i:s');
    $image = $_REQUEST['photo_m'] ? $_REQUEST['photo_m'] : '';

    $datosRecibidos =
      array(
        'name' => $name,
        'street' => $street,
        'phone' => $phone,
        'mobile' => $mobile,
        'rm_longitude' => $rm_longitude,
        'rm_latitude' => $rm_latitude,
        'property_product_pricelist' => $property_product_pricelist,
        'image' => $image,
        'user_id' => $user_id,
        'razon_social' => $razon_social,
        'nit' => $nit,
        'rm_sync_date_time' => $rm_sync_date_time,
      );

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");

    if ($id) {
      $datosCliente = array(array($id), $datosRecibidos);
      // print_r($datosCliente);
      $id = $models->execute_kw($db, $uid, $password, 'res.partner', 'write', $datosCliente);
    } else {
      $id = $models->execute_kw($db, $uid, $password, 'res.partner', 'create', array($datosRecibidos));
    }

    if (Is_Numeric($id) OR is_bool ($id)) {
      $resultado = true;
    } else if (is_array($id)) {
      $resultado = false;
    }

    if ($resultado) {
      echo $_GET['callback'].'({"partner_id": '. $id . ',"status":"success"})';
    } else {
      print_r($_REQUEST);
      print_r($datosRecibidos);
      print_r($id);
    }
}

?>
