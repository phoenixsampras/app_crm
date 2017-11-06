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

    case 'rmListaPedidos':
      rmListaPedidos($db);
    break;

    case 'rmListaProductos':
      rmListaProductos($db);
    break;

    case 'rmRegistrarPedido':
      rmRegistrarPedido($data);
    break;

    case 'rmRegistrarLineaPedido':
      rmRegistrarLineaPedido($data);
    break;

    case 'rmGraficoVentasPlan':
      rmGraficoVentasPlan($db);
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

function rmListaPedidos ($db) {
    try {
        $pedido = $_REQUEST['id'];
        $sql = "
        SELECT
        so.id,
        so.name AS order_number,
        customers.name AS customer,
        so.date_order,
        so.note,
        pp.id as product_id,
        pt.name as product,
        sol.product_uom_qty as qty,
        sol.price_total
        FROM
        public.sale_order AS so
        INNER JOIN public.res_partner AS customers ON so.partner_id = customers.id
        INNER JOIN public.sale_order_line AS sol ON sol.order_id = so.id
        INNER JOIN public.product_product AS pp ON sol.product_id = pp.id
        INNER JOIN public.product_template AS pt ON pp.product_tmpl_id = pt.id
        ORDER BY
        order_number ASC

        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"pedidos": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmListaProductos ($db) {
    try {
        $pedido = $_REQUEST['id'];
        $sql = "
          SELECT
          pp.id,
          pt.list_price AS price,
          pp.default_code AS code,
          pt.name AS product
          FROM
          public.product_product AS pp
          INNER JOIN public.product_template AS pt ON pp.product_tmpl_id = pt.id
          WHERE
          sale_ok = True
        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"rmListaProductos": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmRegistrarPedido($conex, $user_id) {

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

function rmRegistrarLineaPedido($conex, $user_id) {

    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    $rmProduct_id=intval($_REQUEST['rmProduct_id']);
    $rmQuantity=intval($_REQUEST['rmQuantity']);
    $order_id=intval($_REQUEST['order_id']);

    $datos =
      array(
        array(
          'order_id' => $order_id,
          'product_id' => $rmProduct_id,
          // 'price_unit' => $price_unit,
          'product_uom_qty' => $rmQuantity,
          'product_uom' => 1,
        )
      );

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");
    $id = $models->execute_kw($db, $uid, $password, 'sale.order.line', 'create', $datos);

    if (Is_Numeric ($id)) {
      echo $_GET['callback'].'({"orderline_id": '. $id . '})';
    } else {
      print_r($_REQUEST);
      print_r($datos);
      print_r($id);
    }
}

?>
