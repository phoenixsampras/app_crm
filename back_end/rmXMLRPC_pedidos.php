<?php
header("Content-Type: text/javascript");
// error_reporting(E_ALL);
// ini_set('display_errors', TRUE);
// ini_set('display_startup_errors', TRUE);

require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

    case 'rmListaPedidos':
      rmListaPedidos($db);
    break;

    // case 'rmListaProductos':
      // rmListaProductos($db);
    // break;

    case 'rmRegistrarPedidoMasivo':
      rmRegistrarPedidoMasivo($data);
    break;

    case 'rmRegistrarPedido':
      rmRegistrarPedido($data);
    break;

    case 'rmRegistrarLineaPedido':
      rmRegistrarLineaPedido($data);
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
          INNER JOIN public.product_template AS pt ON
          pp.product_tmpl_id = pt.id
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

    $rmUserId=intval($_REQUEST['rmUserId']);
    $rmCustomer=intval($_REQUEST['rmCustomer']);
    $rmDateOrder=$_REQUEST['rmDateOrder'];
    $rmNote=$_REQUEST['rmNote'];
    $latitude=$_REQUEST['latitude'];
    $longitude=$_REQUEST['longitude'];
    $numberOrder=$_REQUEST['numberOrder'];
    $selectedProducts=json_decode($_REQUEST['selectedProducts']);

    $datosVenta =
    array(
      array(
        'user_id' => $rmUserId,
        'partner_id' => $rmCustomer,
        'date_order' => $rmDateOrder,
        'note' => $rmNote,
        'rm_latitude' => $latitude,
        'rm_longitude' => $longitude,
        'origin' => $numberOrder,
      )
    );

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");
    $id = $models->execute_kw($db, $uid, $password, 'sale.order', 'create', $datosVenta);

    if (Is_Numeric ($id)) {
      rmRegistrarLineaPedidoEmbeded($conex, $user_id, $selectedProducts, $id);
      echo $_GET['callback'].'({"order_id": '. $id . ',"status":"success"})';
    } else {
      print_r($_REQUEST);
      print_r($datosVenta);
      print_r($id);
    }
}

function VerificarCliente ($conex,$partner = '') {
  $url = $conex['url'];
  $db = $conex['db'];
  $username = $conex['username'];
  $password = $conex['password'];

  $filtroCliente =
  array(
    array(
      array(
        'id','=',$partner->id,
      )
    )
  );

  $uid = login($conex);
  $models = ripcord::client("$url/xmlrpc/2/object");
  $rmListaCliente = $models->execute_kw($db, $uid, $password,
      'res.partner', 'search_read', $filtroCliente,
      array('fields'=>array(
      'id',
      'name',
      ), 'limit'=>10000));

  if ($rmListaCliente) {
    return $rmListaCliente;
  } else {
    print_r($partner);
    $name = $partner->name  ? $partner->name : '';
    $street = $partner->street ? $partner->street: '';
    $phone = $partner->phone ? $partner->phone: '';
    $mobile = $partner->mobile ? $partner->mobile: '';
    $rm_longitude = $partner->rm_longitude ? $partner->rm_longitude: '';
    $rm_latitude = $partner->rm_latitude ? $partner->rm_latitude: '';
    if ($id) {
      $property_product_pricelist = $partner->property_product_pricelist ? 'product.pricelist,'.$partner->property_product_pricelist: 1;
    } else {
      $property_product_pricelist = $partner->property_product_pricelist ? 'product.pricelist,'.$partner->property_product_pricelist: 1;
      // $property_product_pricelist = $partner->property_product_pricelist ? $partner->property_product_pricelist: 1;
    }
    $user_id = intval($partner->user_id) ? intval($partner->user_id) : 0;
    $razon_social = $partner->razon_social ? $partner->razon_social : 'Ninguno';
    $nit = $partner->nit ? $partner->nit : '0';
    $rm_sync_date_time = $partner->rm_sync_date_time ? $partner->rm_sync_date_time : date('Y-m-d H:i:s');
    $image = $partner->photo_m ? $partner->photo_m : '';

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
    $datosCliente = array(array($id), $datosRecibidos);
    print_r($datosCliente);
    // $id = $models->execute_kw($db, $uid, $password, 'res.partner', 'create', array($datosRecibidos));
  }
}

function rmRegistrarPedidoMasivo($conex, $user_id = '') {

	if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers:        {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }
    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    $postdata = file_get_contents("php://input");
    $jsondata = json_decode($postdata);

    // print_r($jsondata->);
    // echo "User Id 2<br/>";
    /*echo "Pedidos Masivo 2<br/>";

    exit;*/
    $rmUserId= intval($jsondata->rmUserId);
    $orderIds = [];
    $errors = [];
    // Obtaining orders from app
    // for ($_REQUEST['pedidos']) {
    //echo "RECONTANDO" . count($jsondata->pedidos);
    for ($i = 0; $i < count($jsondata->pedidos); $i++) {
      echo "contando" . $i;
      // $rmCustomer=$pedido->customerObj;
      print_r($jsondata->pedido->customerObj);

      $rmCustomer = VerificarCliente($conex,$jsondata->pedido->customerObj);

	    $pedido = $jsondata->pedidos[$i];
      //$rmUserId=intval($_REQUEST['rmUserId']);
      $rmDateOrder=$pedido->dateOrder;
      $rmNote=$pedido->notes;
      $latitude=$pedido->latitude;
      $longitude=$pedido->longitude;
      $numberOrder=$pedido->numberOrder;
      $selectedProducts=$pedido->selectedProducts;

	  $datosVenta =
		array(
		  array(
			'user_id' => $rmUserId,
			'partner_id' => intval($rmCustomer->id),
			'date_order' => $rmDateOrder,
			'note' => $rmNote,
			'rm_latitude' => $latitude,
			'rm_longitude' => $longitude,
			'origin' => $numberOrder,
		  )
		);

		$uid = login($conex);

		$models = ripcord::client("$url/xmlrpc/2/object");
		// $id = $models->execute_kw($db, $uid, $password, 'sale.order', 'create', $datosVenta);

		if (Is_Numeric ($id)) {
		  rmRegistrarLineaPedidoEmbeded($conex, $user_id, $selectedProducts, $id);
		  $orderIds[] = $id;
		  //echo json_encode(["order_id"=>$id ,"status"=>"success"]);
		} else {
		  //print_r($_REQUEST);
		  //print_r($datosVenta);
		  $errors[] = $id;
		}
    }

	if(!empty($orderIds)) {
		echo json_encode(["order_ids"=>$orderIds ,"status"=>"success"]);
	} else {
		echo json_encode(["errors"=>$errors ,"status"=>"error"]);
	}
}

function rmRegistrarLineaPedidoEmbeded($conex, $user_id, $selectedProducts, $order_id) {

    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");

    foreach ($selectedProducts as $producto) {
      $rmProduct_id=$producto->product->id;
      $rmQuantity=$producto->quantity;
      $order_id=$order_id;
      $name = $producto->product->product;
      $price_unit = floatval($producto->product->selectedPrice);

      $datos =
        array(
          array(
            'order_id' => $order_id,
            'product_id' => $rmProduct_id,
            'name' => $name,
            'price_unit' => $price_unit,
            'product_uom_qty' => $rmQuantity,
            'product_uom' => 1,
            'route_id' => 3 // BUG ODOO !! no encuentra la ruta por defecto
          )
        );

      $id = $models->execute_kw($db, $uid, $password, 'sale.order.line', 'create', $datos);

      if (Is_Numeric ($id)) {
        // echo $_GET['callback'].'({"orderline_id": '. $id . ',"status":"success"})';
      } else {
        print_r($_REQUEST);
        print_r($datos);
        print_r($id);
      }
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
          'route_id' => 3 // BUG ODOO !! no encuentra la ruta por defecto
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
