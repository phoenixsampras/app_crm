<?php
    header("Content-Type: text/javascript");

    // print_r($_REQUEST);
    /*
     * Script:    DataTables server-side script for PHP and PostgreSQL
     * Copyright: 2010 - Allan Jardine
     * License:   GPL v2 or BSD (3-point)
     */
     
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Easy set variables
     */
     
    /* Array of database columns which should be read and sent back to DataTables. Use a space where
     * you want to insert a non-database field (for example a counter or static image)
     */
    require_once('../rmDbConfig.php');

    $aColumns = array (
        "name",
        "razon_social", 
        "nit", 
        "telefono", 
        "direccion",
        "ruta"
        // "partner_latitude", 
        // "partner_longitude"
        );
     
    /* Indexed column (used for fast and accurate table cardinality) */
    $sIndexColumn = "id";
     
    /* DB table to use */
    $sTable = "rmAppListaClientes";
     
    /* Database connection information */
    $gaSql['credentials']       = $credentials;
    $gaSql['db']                = $dbname;
    $gaSql['server']            = $host;

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * If you just want to use the basic configuration for DataTables with PHP server-side, there is
     * no need to edit below this line
     */
     

    /*
     * DB connection
     */
    $gaSql['link'] = pg_connect(
        $gaSql['server']. " " .
        $gaSql['db']. " " .
        $gaSql['credentials']
    ) or die('Could not connect: ' . pg_last_error());
     
     
    /*
     * Paging
     */
    $sLimit = "";
    if ( isset( $_GET['start'] ) && $_GET['length'] != '-1' )
    {
        $sLimit = "LIMIT ".intval( $_GET['length'] )." OFFSET ".
            intval( $_GET['start'] );
    }
     
    /*
     * Ordering
     */

    for ( $i=0 ; $i<count( $_GET['columns'] ) ; $i++ )
    {
        // echo "ORDERING" . $_GET['order'][0]['column'] ."------". $i;
        if ( $_GET['columns'][$i]['orderable'] == "true" )
        {
            if ($_GET['order'][0]['column'] == $i ) {
                $sOrder = "ORDER BY  ";
                $sOrder .= $aColumns[$i] . "
                        ".($_GET['order'][0]['dir']==='asc' ? 'asc' : 'desc');
            }
        }
    }

    // if ( isset( $_GET['iSortCol_0'] ) )
    // {
    //     $sOrder = "ORDER BY  ";
    //     for ( $i=0 ; $i<intval( $_GET['columns'] ) ; $i++ )
    //     {
    //         if ( $_GET[ 'bSortable_'.intval($_GET['iSortCol_'.$i]) ] == "true" )
    //         {
    //             $sOrder .= $aColumns[ intval( $_GET['iSortCol_'.$i] ) ]."
    //                 ".($_GET['sSortDir_'.$i]==='asc' ? 'asc' : 'desc').", ";
    //         }
    //     }
         
    //     $sOrder = substr_replace( $sOrder, "", -2 );
    //     if ( $sOrder == "ORDER BY" )
    //     {
    //         $sOrder = "";
    //     }
    // }
     
     
    /*
     * Filtering
     * NOTE This assumes that the field that is being searched on is a string typed field (ie. one
     * on which ILIKE can be used). Boolean fields etc will need a modification here.
     */
    // $sWhere = "";
    // if ( $_GET['sSearch'] != "" )
    // {
    //     $sWhere = "WHERE (";
    //     for ( $i=0 ; $i<count($aColumns) ; $i++ )
    //     {
    //         if ( $_GET['bSearchable_'.$i] == "true" )
    //         {
    //             $sWhere .= $aColumns[$i]." ILIKE '%".pg_escape_string( $_GET['sSearch'] )."%' OR ";
    //         }
    //     }
    //     $sWhere = substr_replace( $sWhere, "", -3 );
    //     $sWhere .= ")";
    // }

    // echo 'BUSQUEDA' . $_GET['search']['value'];
    // Busqueda
    $sWhere = "";
    if ( $_GET['search']['value'] != "" )
    {
        $sWhere = "WHERE (";
        $sWhere .= "name ILIKE '%".pg_escape_string( $_GET['search']['value'] )."%'  ";
        $sWhere .= "OR ruta ILIKE '%".pg_escape_string( $_GET['search']['value'] )."%'  ";
        $sWhere .= ")";
    }

     
    /* Individual column filtering */
    for ( $i=0 ; $i<count($aColumns) ; $i++ )
    {
        if ( $_GET['bSearchable_'.$i] == "true" && $_GET['sSearch_'.$i] != '' )
        {

            $sWhere .= $aColumns[$i]." ILIKE '%".pg_escape_string($_GET['sSearch_'.$i])."%' ";
        }
    }
     
    // Vendedor     
    if ( $sWhere == "" )
    {
        // $sWhere = "WHERE ";
        // Vendedor
        if ($_GET['vendedor']) {
            $sWhere = "WHERE vendedor ILIKE '" . $_GET['vendedor'] . "'";
        }

    }
    else
    {
        // $sWhere .= " AND ";
        if ($_GET['vendedor']) {
            $sWhere .= " AND vendedor ILIKE '" . $_GET['vendedor'] . "'";
        }
    }
     
    $sQuery = "
        SELECT ".str_replace(" , ", " ", implode(", ", $aColumns))."
        FROM   $sTable
        $sWhere
        $sOrder
        $sLimit
    ";

    // echo $sQuery;

    $rResult = pg_query( $gaSql['link'], $sQuery ) or die(pg_last_error());
     
    $sQuery = "
        SELECT $sIndexColumn
        FROM   $sTable
    ";
    $rResultTotal = pg_query( $gaSql['link'], $sQuery ) or die(pg_last_error());
    $iTotal = pg_num_rows($rResultTotal);
    pg_free_result( $rResultTotal );
     
    if ( $sWhere != "" )
    {
        $sQuery = "
            SELECT $sIndexColumn
            FROM   $sTable
            $sWhere
        ";
        $rResultFilterTotal = pg_query( $gaSql['link'], $sQuery ) or die(pg_last_error());
        $iFilteredTotal = pg_num_rows($rResultFilterTotal);
        pg_free_result( $rResultFilterTotal );
    }
    else
    {
        $iFilteredTotal = $iTotal;
    }
     
     
     
    /*
     * Output
     */
    $output = array(
        "sEcho" => intval($_GET['sEcho']),
        "iTotalRecords" => $iTotal,
        "iTotalDisplayRecords" => $iFilteredTotal,
        "aaData" => array()
    );
     
    while ( $aRow = pg_fetch_array($rResult, null, PGSQL_ASSOC) )
    {
        $row = array();
        for ( $i=0 ; $i<count($aColumns) ; $i++ )
        {
            if ( $aColumns[$i] == "version" )
            {
                /* Special output formatting for 'version' column */
                $row[] = ($aRow[ $aColumns[$i] ]=="0") ? '-' : $aRow[ $aColumns[$i] ];
            }
            else if ( $aColumns[$i] != ' ' )
            {
                /* General output */
                $row[] = $aRow[ $aColumns[$i] ];
            }
        }
        $output['aaData'][] = $row;
    }
     
    // JsonP
    $jsonp = preg_match('/^[$A-Z_][0-9A-Z_$]*$/i', $_GET['callback']) ?
        $_GET['callback'] :
        false;
     
    if ( $jsonp ) {
        echo $jsonp.'('.json_encode(
            $output
        ).');';
    }

    // echo json_encode( $output );
     
    // Free resultset
    pg_free_result( $rResult );
     
    // Closing connection
    pg_close( $gaSql['link'] );
?>