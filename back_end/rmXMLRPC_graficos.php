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

    case 'rmGraficoVentasEjecutadas':
      rmGraficoVentasEjecutadas($db);
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


function rmGraficoVentasEjecutadas ($db) {
    try {

        if ($_REQUEST['user_id']) {
          // echo "FILTRO USUARIO";
          $where_user1 = ' AND so.user_id in (' . $_REQUEST['user_id'] . ")";
          $where_user2 = ' AND rp.user_id in (' . $_REQUEST['user_id'] . ")";
        }

        $sql = "
        SELECT count(id) AS pedidos FROM sale_order AS so
        WHERE extract(dow from so.date_order)  = extract(dow from  current_date)

        " . $where_user1 . "
        ;
        ";

        $query = pg_query($db, $sql);
        if(!$query){
          echo "Error".pg_last_error($db);
          exit;
        }

        $resultado1 = pg_fetch_all($query);

        // Segunda consulta
        $sql2 = "
        SELECT
        count(rp.id) AS clientes
        FROM
        public.partner_id AS p
        INNER JOIN public.rm_dias_semana AS dias ON p.rm_dias_semana_id = dias.id
        INNER JOIN public.res_partner AS rp ON p.dias_id = rp.id
        WHERE dias.nro_dia = extract(dow from  current_date)
        " . $where_user2 . "
        ;
        ";

        $query2 = pg_query($db, $sql2);
        if(!$query2){
          echo "Error".pg_last_error($db);
          exit;
        }

        $resultado2 = pg_fetch_all($query2);

        $resultado = array_merge($resultado1, $resultado2);

        echo $_GET['callback'].'({"rmGraficoVentasEjecutadas": ' . json_encode($resultado) . '})';
        pg_close($db);

    } catch(PDOException $e) {
        echo $_GET['callback'].'({"error":{"text":'. pg_last_error($db) .'}})';
        exit;
    }
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
				SELECT rm_objetivo_mes as rm_proyeccion_ventas_mensual, sum(sol.price_subtotal) AS sales_total
        FROM res_users AS rc,
        sale_order_line AS sol
        WHERE  EXTRACT(month FROM sol.write_date) = EXTRACT(month FROM CURRENT_DATE) AND
				rc.id = ".$_REQUEST['user_id']." AND
        sol.salesman_id = ".$_REQUEST['user_id']."  
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
