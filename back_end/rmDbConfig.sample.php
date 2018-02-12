<?php
  //Conexion para POSTGRESQL
  // $host        = "host=192.168.1.159";
  $host        = "host=74.50.117.68";
  $port        = "port=5435";
  $dbname      = "dbname=ORGANICA";
  $credentials = "user=odoo password=Desys3UGQFNK6pB";

  $db = pg_connect( "$host $port $dbname $credentials"  );
  if(!$db){
    echo "Error : Unable to open database\n";
  } else {
//    echo "Opened database successfully\n";
  }
?>
