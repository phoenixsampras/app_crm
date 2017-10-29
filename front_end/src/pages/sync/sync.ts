import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';
import { PositionService } from '../orders/position.service';
import { DatabaseService } from './database.service';
import { SyncService } from './sync.service';
import { AlertController } from 'ionic-angular';


@Component({
  selector: 'sync-page',
  templateUrl: 'sync.html'
})
export class SyncPage {

  messages: any = [];
  loading: any;
  constructor(
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public ordersService: OrdersService,
    public positionService: PositionService,
    public databaseService: DatabaseService,
    public syncService: SyncService,
    public alertCtrl: AlertController
  ) {

  }

  // Obtener clientes de Servidor a PouchDB
  loadCustomers() {
    if (window.navigator.onLine) {
      this.syncService
        .getDataFromServer()
        .then(data => {
          let items = data.rmListaClientes;
          for (var i = 0; i < items.length; i++) {
            //console.log(this.customersList.items[i].id);
            this.syncService.addCustomer(items[i]);
          }

        });
    }
  }


  sinInternet() {
    const alert = this.alertCtrl.create({
      title: 'Conectividad',
      subTitle: 'El servicio de Internet no esta disponible',
      buttons: ['Aceptar']
    });
    alert.present();
  }

  wipeData() {
    this.databaseService.deleteDB();
  }

  syncData() {

    if (window.navigator.onLine) {
      this.messages.push('Sync Started');
      this.ordersService
        .getData()
        .then(data => {
          for (var i = 0; i < data.length; i++) {
            var order = data[i];
            let selectedProducts = order.selectedProducts;
            var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarPedido&rmCustomer=" + order.customer + "&rmDateOrder=" + order.dateOrder + "&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
            url = encodeURI(url);
            this.ordersService.saveOrderOnServer(url).then(data => {
              let order_id = data._body.order_id;
              console.log(data._body.order_id);
              console.log('order with id-' + order._id + ' Uploaded ');

              for (var j = 0; j < selectedProducts.length; j++) {
                setTimeout(function() {
                  console.log('Delaying...');
                }, 1000);
                let productId = selectedProducts[j].product.id;
                let quantity = selectedProducts[j].quantity;
                var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarLineaPedido&order_id=" + order_id + "&rmQuantity=" + quantity + "&rmProduct_id=" + productId + "&callback=JSONP_CALLBACK";
                url = encodeURI(url);
                this.ordersService.saveOrderOnServer(url).then(data2 => {
                  console.log("rmRegistrarLineaPedido:" + data2);
                });
              }
              this.messages.push('Order with id-' + order._id + ' Uploaded ');
            });
          }
        }
      ).then(function (){
      });

      this.positionService
        .getData()
        .then(data => {
          for (var i = 0; i < data.length; i++) {
            var position = data[i];
            //var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
            var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmRegistrarGeolocalizacion&res_user_id=11&longitude=" + position.lat + "&latitude=" + position.lat + "&callback=JSONP_CALLBACK";
            url = encodeURI(url);
            this.positionService.savePositionOnServer(url).then(data => {
              console.log('Position with id-' + position._id + ' Uploaded');
              this.messages.push('Position with id-' + position._id + ' Uploaded ');
            });
          }
        });

    } else {
      this.sinInternet();
      // alert('Device Not Online');
    }
  }

}
