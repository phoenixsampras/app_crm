<?php
header("Content-Type: text/javascript");
error_reporting(1);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task2"]) {

    // case 'rmTipoCliente':
    //   rmTipoCliente($db);
    // break;
    //
    // case 'rmListaClientes':
    //   rmListaClientes($db);
    // break;
    //
    // case 'rmListaPedidos':
    //   rmListaPedidos($db);
    // break;
    //
    // case 'rmRegistrarPedido':
    //   rmRegistrarPedido($data);
    // break;
    case 'login':
        login($data);
    break;
    case 'loginApp':
        loginApp($data);
    break;
//
//     // case 'agregarUbicacion':
//     //     grabarPosicionUsuario($data,$_REQUEST['user_id']);
//     // break;
//     //
//     // case 'zonaclientes':
//     //     zonaclientes($db);
//     // break;
//     //
//     // case 'rutaclientes':
//     //     rutaclientes($db);
//     // break;
//     //
//     // case 'rubroCliente':
//     //     rubroCliente($db);
//     // break;
//     //
//     //
//     // case 'detallePedido':
//     //     detallePedido($db);
//     // break;
//     //
//     // case 'registrarCliente':
//     //     registrarCliente($data,$_REQUEST['user_id']);
//     // break;
//     //
//     // case 'registrarUsuario':
//     //     registrarUsuario($data);
//     // break;
//
//     default:
//         echo "What are you doing here?";
//
// }
//
// function login($conex){
//
//
//     $db = $conex['db'];
//     $username = $conex['username'];
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
          so.note
          FROM
          public.sale_order AS so
          INNER JOIN public.res_partner AS customers ON so.partner_id = customers.id
          order by order_number
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

function rmTipoCliente ($db) {
    try {
        $sql = "select  id, rm_name from rm_tipo_cliente order by rm_name asc";
        $query = pg_query($db, $sql);
        if(!$query){
          echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);
        echo $_GET['callback'].'({"tipoCliente": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmListaClientes ($db) {
    try {
        $pedido = $_REQUEST['id'];
        $sql = "
          Select id, name from res_partner order by name
            ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"listaClientes": ' . json_encode($resultado) . '})';
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

//
//
// function registrarUsuario($conex, $user_id) {
//
//     $url = $conex['url'];
//     $db = $conex['db'];
//     $username = $conex['username'];
//     $password = $conex['password'];
//
//     // print_r($_REQUEST);
//     $rmUsuario=$_REQUEST['rmUsuario'];
//     $rmPassword=$_REQUEST['rmPassword'];
//     $rmEmail=$_REQUEST['rmEmail'];
//     $rmRazonSocial=$_REQUEST['rmRazonSocial'];
//     $rmNit=$_REQUEST['rmNit'];
//     $rmDireccion=$_REQUEST['rmDireccion'];
//     $rmTelefono=$_REQUEST['rmTelefono'];
//     $rmCelular=$_REQUEST['rmCelular'];
//     $rmTipoUsuario=$_REQUEST['rmTipoUsuario'];
//     $rmRubro=$_REQUEST['rmRubro'];
//     $rmZonaCliente=$_REQUEST['rmZonaCliente'];
//
//     $datosCliente = array(
//             'name' => $rmUsuario,
//             'email' => $rmEmail,
//             'legal_name_customer' => $rmRazonSocial,
//             'nit' => $rmNit,
//             'address' => $rmDireccion,
//             'phone' => $rmTelefono,
//             'mobile' => $rmCelular,
//             'ew_zonas_cliente_id' => $rmZonaCliente,
//             'ew_rutas_cliente_id' => 65,
//             'dias_credito_cliente'  => 0,
//             'cantidad_restriccion' => 0,
//             // 'tipo_cliente' => $rmTipoUsuario,
//             'tipo_usuario' => $rmTipoUsuario,
//             'rubro_cliente' => $rmRubro,
//             );
//
//     $datosUsuario = array(
//         array(
//             'name' => $rmUsuario,
//             'login' => $rmEmail,
//             // 'legal_name_customer' => $rmRazonSocial,
//             // 'nit' => $rmNit,
//             // 'address' => $rmDireccion,
//             // 'phone' => $rmTelefono,
//             // 'mobile' => $rmCelular,
//             // 'ew_zonas_cliente_id' => 83,
//             // 'ew_rutas_cliente_id' => 65,
//             // 'dias_credito_cliente'  => 0,
//             // 'cantidad_restriccion' => 0
//             )
//         );
//
//     // print_r($datosCliente);
//
//     $uid = login($conex);
//     $models = ripcord::client("$url/xmlrpc/2/object");
//     $id = $models->execute_kw($db, $uid, $password, 'res.users', 'create', $datosUsuario);
//     // print_r($id);
//     // echo $id["faultString"];
//     // echo "USUARIO:/n/n";
//     // echo $_GET['callback'].'({"login": '. $id . '})';
//
//     if (is_numeric($id)) {
//         // echo "Usuario Creado" . $id;
//         $rmUsuario = $models->execute_kw($db, $uid, $password, 'res.users', 'search_read', array(array(array('id', '=', $id))), array('fields'=>array('partner_id'), 'limit'=>5));
//         // print_r($rmUsuario);
//
//         $partner_id = $rmUsuario[0]['partner_id'][0];
//
//         if (is_numeric($partner_id)) {
//             // echo "Actualizando Usuario" . $id;
//
//             $id2 = $models->execute_kw($db, $uid, $password, 'res.partner', 'write', array(array($partner_id), $datosCliente));
//             // get record name after having changed it
//             // $models->execute_kw($db, $uid, $password, 'res.partner', 'name_get', array(array($id)));
//
//             // $id2 = $models->execute_kw($db, $uid, $password, 'res.partner', 'create', $datosCliente);
//             echo $_GET['callback'].'({"cliente": ' . ($id2) . '})';
//         } else {
//             echo "No se ha podido actualizar el cliente";
//         }
//         // print_r($partner_id);
//         // print_r($id2);
//     } else {
//         // echo $_GET['callback'].'({"cliente": ' . (0) . '})';
//         echo $_GET['callback'].'({"cliente": "'.$id['faultString'].'"})';
//         // echo "Email repetido";
//     }
//
//
// }
//
// function registrarCliente($conex, $user_id) {
//
//     $url = $conex['url'];
//     $db = $conex['db'];
//     $username = $conex['username'];
//     $password = $conex['password'];
//
//     // print_r($_REQUEST);
//     $rmName=$_REQUEST['rmName'];
//     $rmRazonSocial=$_REQUEST['rmRazonSocial'];
//     $rmNit=$_REQUEST['rmNit'];
//     $ew_zonas_cliente_id=$_REQUEST['ew_zonas_cliente_id'];
//     $ew_rutas_cliente_id=$_REQUEST['ew_rutas_cliente_id'];
//     $rmComment=$_REQUEST['rmComment'];
//
//
//     $datosCrear = array(
//         array(
//             'name' => $rmName,
//             'legal_name_customer' => $rmRazonSocial,
//             'nit' => $rmNit,
//             'ew_zonas_cliente_id' => $ew_zonas_cliente_id,
//             'ew_rutas_cliente_id' => $ew_rutas_cliente_id,
//             'comment' => $rmComment
//             )
//         );
//
//     // print_r($datosCrear);
//
//     $uid = login($conex);
//     $models = ripcord::client("$url/xmlrpc/2/object");
//     $id = $models->execute_kw($db, $uid, $password, 'res.partner', 'create', $datosCrear);
//     // echo $id;
//     echo $_GET['callback'].'({"login": '. $id . '})';
//
//     // print_r($id);
// }
//
// function detallePedido ($db) {
//     try {
//         $pedido = $_REQUEST['id'];
//         $sql = "SELECT id, producto, venta, precio, cantidad, 'porcentaje descuento', subtotal_neto
//             FROM rmappdetallepedido
//             WHERE soid = " . $_REQUEST['soid'] . "
//             ORDER by producto asc
//             ";
//
//         $query = pg_query($db, $sql);
//         if(!$query){
//         echo "Error".pg_last_error($db);
//         exit;
//         }
//
//         $resultado = pg_fetch_all($query);
//
//         echo $_GET['callback'].'({"detallePedido": ' . json_encode($resultado) . '})';
//         pg_close($db);
//
//     } catch(PDOException $e) {
//         echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
//         exit;
//     }
// }
//
// function zonaclientes ($db) {
//     try {
//         $sql = "select id, nombre from ew_zonas_cliente order by nombre asc
//             ";
//
//         $query = pg_query($db, $sql);
//         if(!$query){
//         echo "Error".pg_last_error($db);
//         exit;
//         }
//
//         $resultado = pg_fetch_all($query);
//
//         echo $_GET['callback'].'({"zonaclientes": ' . json_encode($resultado) . '})';
//         pg_close($db);
//
//     } catch(PDOException $e) {
//         echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
//         exit;
//     }
// }
//
// function rutaclientes ($db) {
//     try {
//         $sql = "select  id, ruta as nombre from ew_rutas_zonas order by ruta asc
//             ";
//
//         $query = pg_query($db, $sql);
//         if(!$query){
//         echo "Error".pg_last_error($db);
//         exit;
//         }
//
//         $resultado = pg_fetch_all($query);
//
//         echo $_GET['callback'].'({"rutaclientes": ' . json_encode($resultado) . '})';
//         pg_close($db);
//
//     } catch(PDOException $e) {
//         echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
//         exit;
//     }
// }
//
// function rubroCliente ($db) {
//     try {
//         $sql = "select  id, name from rm_rubro_cliente order by name desc
//             ";
//
//         $query = pg_query($db, $sql);
//         if(!$query){
//         echo "Error".pg_last_error($db);
//         exit;
//         }
//
//         $resultado = pg_fetch_all($query);
//
//         echo $_GET['callback'].'({"rubroCliente": ' . json_encode($resultado) . '})';
//         pg_close($db);
//
//     } catch(PDOException $e) {
//         echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
//         exit;
//     }
// }
//
//
//
function loginApp($conex){
    $url = $conex['url'];
    $db = $conex['db'];
    $username = $_REQUEST['username'];
    $password = $_REQUEST['password'];

    if ($username && $password){
        $common = ripcord::client("$url/xmlrpc/2/common");
        $uid = $common->authenticate($db, $username, $password, array());
        echo "usuario: </br>" . $uid;
        // Autenticarse
        if ($uid){
            // $uid = login($conex);
            $models = ripcord::client("$url/xmlrpc/2/object");
            $rmDatosUsuario = $models->execute_kw($db, $uid, $password, 'res.users', 'search_read', array(array(array('id', '=', $uid))), array('fields'=>array('ew_vendedor', 'partner_id'), 'limit'=>5));
            $partner_id = $rmDatosUsuario[0]['partner_id'][0];
            $ew_vendedor = $rmDatosUsuario[0]['ew_vendedor'][0];
            echo "/n rmDatosUsuario:" .  $partner_id;
            // print_r($rmDatosUsuario);

            // Si es vendedor
            if ($ew_vendedor) {
                echo $_GET['callback'].'({"login": '.$uid.',"vendedor":"' . $rmDatosUsuario[0]['ew_vendedor'][1] . '","ciudad":false,"partner_id":0})';

            // Si es Cliente
            } else {
                $rmDatosCliente = $models->execute_kw($db, $uid, $password, 'res.partner', 'search_read', array(array(array('id', '=', $partner_id))), array('fields'=>array('ew_zonas_cliente_id'), 'limit'=>5));
                // echo "/n rmDatosCliente:";
                // print_r($rmDatosCliente);
                echo $_GET['callback'].'({"login": '.$uid.',"vendedor":"false","ciudad":"' . $rmDatosCliente[0]['ew_zonas_cliente_id'][1] . '", "partner_id": '. $rmDatosCliente[0]['id'] .'})';
            }
            // print_r($rmDatosUsuario);

        } else {
            echo $_GET['callback'].'({"login": "False"})';
        }
        // return $common->authenticate($db, $username, $password, array());
    }else {
        echo $_GET['callback'].'({"login": "NULL"})';
    }
}

// function grabarPosicionUsuario($conex, $user_id) {
//
//     $url = $conex['url'];
//     $db = $conex['db'];
//     $username = $conex['username'];
//     $password = $conex['password'];
//
//     $user_id = $_REQUEST['user_id'];
//     $ew_fecha = $_REQUEST['ew_fecha'];
//     $rm_foto = $_REQUEST['rm_foto'];
//
//     $uid = login($conex);
//     $models = ripcord::client("$url/xmlrpc/2/object");
//
//     // $id = $models->execute_kw($db, $uid, $password, 'ew.historial.posicion', 'create', array(array('ew_usuario_id' => 1, 'image' => $rm_foto, 'nombre_imagen'=> $ew_fecha, 'ew_fecha' => $ew_fecha)));
//     $id = $models->execute_kw($db, $uid, $password, 'ew.historial.posicion', 'create', array(array('ew_usuario_id' => 1, 'nombre_imagen'=> $ew_fecha, 'ew_fecha' => $ew_fecha)));
//     echo $id;
// }
//
//
// function grabarFotoUsuario($conex, $user_id) {
//
//     $url = $conex['url'];
//     $db = $conex['db'];
//     $username = $conex['username'];
//     $password = $conex['password'];
//
//     $user_id = $_REQUEST['user_id'];
//     $ew_fecha = $_REQUEST['ew_fecha'];
//     $ew_latitud = $_REQUEST['ew_latitud'];
//     $ew_longitud = $_REQUEST['ew_longitud'];
//
//     $uid = login($conex);
//     $models = ripcord::client("$url/xmlrpc/2/object");
//
//     // $id = $models->execute_kw($db, $uid, $password, 'ew.historial.posicion', 'create', array(array('ew_usuario_id' => $user_id, 'ew_latitud'=>'123', 'ew_longitud'=>'123')));
//
//     $id = $models->execute_kw($db, $uid, $password, 'ew.historial.posicion', 'create', array(array('ew_usuario_id' => 1, 'ew_latitud' => $ew_latitud, 'ew_longitud'=> $ew_longitud, 'ew_fecha' => $ew_fecha)));
//     echo $id;
// }
//
// ?>
