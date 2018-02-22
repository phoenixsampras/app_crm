<?php
header("Content-Type: text/javascript");
error_reporting(1);
require_once('rmOdooConfig.php');
require_once('rmDbConfig.php');
require_once('xmlrpc_lib/ripcord.php');

// print_r($_REQUEST);
switch ($_REQUEST["task"]) {

    case 'rmGraficoVentasDiarioPlan':
      rmGraficoVentasDiarioPlan($db);
    break;

    case 'rmGraficoVentasMesPlan':
      rmGraficoVentasMesPlan($db);
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

function rmGraficoVentasDiarioPlan ($db) {
    try {

        if ($_REQUEST['user_id']) {
          // echo "FILTRO USUARIO";
          $where_user = ' WHERE u.id in (' . $_REQUEST['user_id'] . ")";
        }

        $pedido = $_REQUEST['id'];
        $sql = "
        SELECT
        so.date_order::timestamp::date as date_order,
        u.rm_objetivo_diario as plan,
				u.login,
        sum(sol.price_subtotal) as quantity
        FROM
        sale_order AS so
        INNER JOIN sale_order_line AS sol ON sol.order_id = so.id
				INNER JOIN res_users AS u ON so.user_id = u.id
        " . $where_user . "
				GROUP BY 1,2,3
				order by date_order
        ;

        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"rmGraficoVentasDiarioPlan": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

function rmGraficoVentasMesPlan ($db) {
    try {

        $sql = "
        SELECT rm_proyeccion_ventas_mensual, sum(sol.price_subtotal) AS sales_total
        FROM res_company AS rc,
        sale_order_line AS sol
        WHERE  EXTRACT(month FROM sol.write_date) = EXTRACT(month FROM CURRENT_DATE)
        GROUP BY 1
        ;
        ";

        $query = pg_query($db, $sql);
        if(!$query){
        echo "Error".pg_last_error($db);
        exit;
        }

        $resultado = pg_fetch_all($query);

        echo $_GET['callback'].'({"rmGraficoVentasMesPlan": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
}

?>
