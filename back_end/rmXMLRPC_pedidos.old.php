<?php
header("Content-Type: text/javascript");
//error_reporting(0);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

    case 'productos':
        productos($db);
    break;

    case 'listaProductos':
        listaProductos($db);
    break;

    case 'clientes':
        clientes($db);
    break;

    case 'transporte':
        transporte($db);
    break; 

    case 'listaPrecio':
        listaPrecio($db);
    break;

    case 'registrarPedido':
        registrarPedido($data);
    break;

    case 'registrarDetallePedido':
        registrarDetallePedido($data);
    break;

    case 'eliminarDetallePedido':
        eliminarDetallePedido($data);
    break;
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

function registrarPedido($conex) {

    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    // Inicializar conex a odoo
    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");

    // print_r($_REQUEST);
    $rmCliente=intval($_REQUEST['rmCliente']);
    // $rmListaPrecio=intval($_REQUEST['rmListaPrecio']);
    $rmTipoVenta=$_REQUEST['rmTipoVenta'];
    $rmTransporte=intval($_REQUEST['rmTransporte']);
    $rmNota=$_REQUEST['rmNota'];
    $rmFechaTentativaEntrega = $_REQUEST['rmFechaTentativaEntrega'];

    // Obtener Lista de Precio asignado al cliente
    $rmListaPrecio = $models->execute_kw($db, $uid, $password, 'res.partner', 'search_read', array(array(array('id', '=', $rmCliente))), array('fields'=>array('property_product_pricelist'), 'limit'=>5));
    // print_r($rmListaPrecio);
    if ($rmListaPrecio) {
        $rmListaPrecio = ( $rmListaPrecio[0]['property_product_pricelist'][0]);
    } else {
        echo $_GET['callback'].'({"pedido": [{"id":0}] })';
        exit;
    }

    $datosCrear = array(
        array(
            'partner_id' => $rmCliente,
            'pricelist_id' => $rmListaPrecio,
            'tipo_venta' => $rmTipoVenta,
            'transporte' => $rmTransporte,
            'note' => $rmNota,
            'fecha_tentativa_entrega' => '2016-10-25',//$rmFechaTentativaEntrega,
            // 'ew_zonas_cliente_id' => $ew_zonas_cliente_id,
            // 'ew_rutas_cliente_id' => $ew_rutas_cliente_id,
            // 'comment' => $rmComment
            )
        );

    $id = $models->execute_kw($db, $uid, $password, 'sale.order', 'create', $datosCrear);
    // print_r($id);
    if(is_numeric($id)){ 
    // if ($id > 0) {
        $pedido = $models->execute_kw($db, $uid, $password, 'sale.order', 'search_read', array(array(array('id', '=', $id))), array('fields'=>array('name'), 'limit'=>5));
        echo $_GET['callback'].'({"pedido": ' . json_encode($pedido) . '})';
        exit;
    } else {
        echo $_GET['callback'].'({"pedido": [{"id":0}] })';
        exit;
    }

    // echo $_GET['callback'].'({"pedido": '. $id . '})';
}

function registrarDetallePedido($conex) {

    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    // print_r($_REQUEST);
    $rmProducto=intval($_REQUEST['rmProducto']);
    $rmCantidad=intval($_REQUEST['rmCantidad']);
    $rmOrderId=intval($_REQUEST['rmOrderId']);

    $datosCrear = array(
        array(
            'order_id' => $rmOrderId,
            'product_id' => $rmProducto,
            'product_uom_qty' => $rmCantidad,
            'taxes_id' => array(1)
            )
        );

    // print_r($datosCrear);

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");
    $id = $models->execute_kw($db, $uid, $password, 'sale.order.line', 'create', $datosCrear);
    // print_r($id);
    if(is_numeric($id)){ 
    // if ($id > 0) {
        // $pedido = $models->execute_kw($db, $uid, $password, 'sale.order', 'search_read', array(array(array('id', '=', $id))), array('fields'=>array('name'), 'limit'=>5));
        echo $_GET['callback'].'({"pedido": [{"id":'. $id . '}] })';
        exit;
    } else {
        echo $_GET['callback'].'({"pedido": [{"id":0}] })';
    }

    // echo $_GET['callback'].'({"pedido": '. $id . '})';
}

function eliminarDetallePedido($conex) {

    $url = $conex['url'];
    $db = $conex['db'];
    $username = $conex['username'];
    $password = $conex['password'];

    // print_r($_REQUEST);
    $rmDOrderId=intval($_REQUEST['rmDOrderId']);

    $datosBorrar = array(
        array(
            $rmDOrderId
            )
        );

    // $datosBorrar = $rmDOrderId;

    // print_r($datosBorrar);

    $uid = login($conex);
    $models = ripcord::client("$url/xmlrpc/2/object");
    $id = $models->execute_kw($db, $uid, $password, 'sale.order.line', 'unlink', $datosBorrar);
    print_r($id);
    echo $id + $id;
    if(is_numeric($id)){ 
    // if ($id > 0) {
        // $pedido = $models->execute_kw($db, $uid, $password, 'sale.order', 'search_read', array(array(array('id', '=', $id))), array('fields'=>array('name'), 'limit'=>5));
        echo $_GET['callback'].'({"pedidoBorrado": [{"id":'. $id . '}] })';
        exit;
    } else {
        echo $_GET['callback'].'({"pedidoBorrado": [{"id":0}] })';
        exit;
    }

    // echo $_GET['callback'].'({"pedido": '. $id . '})';
}

function listaProductos ($db) {
    try {
        $rmOrderId = $_REQUEST['rmOrderId'];

        $sql = "
            SELECT sol1.id,
            pp.name_template AS producto
            ,sol1.price_unit AS precio
            ,sol1.product_uom_qty AS cantidad
            -- ,sol1.price_subtotal AS subtotal
            ,sol1.price_total AS subtotal
            from sale_order_line sol1
            JOIN product_product pp ON sol1.product_id=pp.id
            WHERE sol1.order_id = " . $rmOrderId;

        $query = pg_query($db, $sql);
        if(!$query){
            echo "Error".pg_last_error($db);
            exit;
        } 

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"listaProductos": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function productos ($db) {
    try {
        $rmProducto = $_REQUEST['rmProducto'];

        $sql = "select id, name_template AS name
                FROM product_product 
                WHERE name_template ~* '" . $rmProducto . "' " .
                "ORDER by name_template asc
            ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        } 

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"productos": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function clientes ($db) {
    try {
        $rmCliente = $_REQUEST['rmCliente'];

        $sql = "select id, name 
                from res_partner 
                WHERE name ~* '" . $rmCliente . "' " .
                "ORDER by name asc
            ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        } 

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"clientes": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function transporte ($db) {
    try {

        $sql = "SELECT
                res_partner.id,
                res_partner.name,
                res_partner.es_camion
                FROM
                res_partner
                WHERE
                res_partner.es_camion = true
                ORDER by name

            ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        } 

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"transporte": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function listaPrecio ($db) {
    try {
        $rmCliente = $_REQUEST['rmCliente'];

        $sql = "SELECT
            product_pricelist.id,
            product_pricelist.name
            FROM
            product_pricelist
            ORDER BY name
            ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        } 

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"listaPrecio": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

?>