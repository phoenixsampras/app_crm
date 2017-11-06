<?php
  //Conexion para POSTGRESQL
  // $host        = "host=192.168.1.159";
  $host        = "host=11.11.11.20";
  $port        = "port=5432";
  $dbname      = "dbname=ORGANICA_APP";
  $credentials = "user=odoo_docker password=xxxxxx";

  $db = pg_connect( "$host $port $dbname $credentials"  );
  if(!$db){
    echo "Error : Unable to open database\n";
  } else {
//    echo "Opened database successfully\n";
  }
?>
