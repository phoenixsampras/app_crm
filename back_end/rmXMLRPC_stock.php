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

    case 'rmStockProductos':
      rmStockProductos($db);
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

function rmStockProductos ($db) {
    try {
        $pedido = $_REQUEST['id'];
        $sql = "

        SELECT
        p.id AS id,
        sp.name,
        sml.product_id,
        sml.product_qty,
        public.res_partner.id AS partner_id,
        public.res_partner.name AS partner,

        pt.name AS product,
        pt.list_price as price,
        pt.default_code AS code,
        sml.product_uom_qty,
        sml.ordered_qty,
        sml.qty_done as stock

        FROM
        public.stock_picking AS sp
        INNER JOIN public.stock_move_line AS sml ON sml.picking_id = sp.id
        LEFT JOIN public.res_partner ON sp.partner_id = public.res_partner.id
        INNER JOIN public.product_product AS p ON sml.product_id = p.id
        INNER JOIN public.product_template AS pt ON p.product_tmpl_id = pt.id

        WHERE
        sp.state = 'done'


--        SELECT
--        pp.id,
--        public.product_template.name as product,
--        floor(random() * (100 + 1)) as quantity
--        FROM
--        public.product_product AS pp
--        INNER JOIN public.sale_order_line AS sol ON sol.product_id = pp.id
--        INNER JOIN public.sale_order AS so ON sol.order_id = so.id
--        INNER JOIN public.product_template ON pp.product_tmpl_id = public.product_template.id
--        group by 1,2
--
        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"rmStockProductos": ' . json_encode($resultado) . '})';
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
