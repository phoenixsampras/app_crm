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
      rmListaClientes($db);
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

function rmListaClientes ($db) {
    try {
        $pedido = $_REQUEST['id'];
        $sql = "
        Select id,
        name as rm_nombre,
        street as rm_direccion,
        phone as rm_telefono,
        mobile as rm_celular,
        0 as rm_longitude,
        0 as rm_latitude,
        '' as photo_m,
        '' as photo_s,
        ('{CM,CG,CH}'::text[])[ceil(random()*3)] as tipo
        from res_partner

        order by name
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

function rmRegistrarCliente($conex, $user_id) {

    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    $rmCustomer=intval($_REQUEST['rmCustomer']);
    $rmDateOrder=$_REQUEST['rmDateOrder'];
    $rmNote=$_REQUEST['rmNote'];

    $datosVenta =
    array(
      array(
        'partner_id' => $rmCustomer,
        'date_order' => $rmDateOrder,
        'note' => $rmNote,
      )
    );

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");
    $id = $models->execute_kw($db, $uid, $password, 'sale.order', 'create', $datosVenta);

    if (Is_Numeric ($id)) {
      echo $_GET['callback'].'({"order_id": '. $id . '})';
    } else {
      print_r($_REQUEST);
      print_r($datosVenta);
      print_r($id);
    }
}

?>
