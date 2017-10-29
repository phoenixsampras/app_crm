<?php
header("Content-Type: text/javascript");
error_reporting(1);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

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

function rmGraficoVentasPlan ($db) {
    try {
        $pedido = $_REQUEST['id'];
        $sql = "
        SELECT
        public.sale_order.date_order::timestamp::date as date_order,
        sum(public.sale_order_line.product_uom_qty) as quantity,
        10000 as plan
        FROM
        public.sale_order
        INNER JOIN public.sale_order_line ON public.sale_order_line.order_id = public.sale_order.id
				GROUP BY date_order
				order by date_order
        ;

        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"rmGraficoVentasPlan": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

?>
