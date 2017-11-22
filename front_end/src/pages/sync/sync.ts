import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';
import { PositionService } from '../orders/position.service';
import { DatabaseService } from './database.service';
import { AlertController } from 'ionic-angular';
import { SyncService } from './sync.service';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../add-order/customers.service';

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
    public productsService: ProductsService,
    public syncService: SyncService,
    public alertCtrl: AlertController,
    public customersService: CustomersService
  ) {

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

  loadProducts() {
    if (window.navigator.onLine) {
      this.productsService
        .getDataFromServer()
        .then(data => {

          let items = data.rmListaProductos;
          for (var i = 0; i < items.length; i++) {
            this.productsService.addProduct(items[i]);
          }
        });
    }
  }

  stockProducts() {
    if (window.navigator.onLine) {
      this.productsService
        .getStockDataFromServer()
        .then(data => {

          let items = data.rmStockProductos;
          for (var i = 0; i < items.length; i++) {
            console.log(items[i]);
            this.productsService.stockProduct(items[i].id, items[i].quantity);


          }
        });
    }
  }

  loadCustomers() {
    if (window.navigator.onLine) {
      this.customersService
        .getDataFromServer()
        .then(data => {
          let items = data.rmListaClientes;
          // console.log("rmListaClientes:" + JSON.stringify(items));
          for (var i = 0; i < items.length; i++) {
            console.log("rmListaClientes:" + JSON.stringify(items[i]));
            console.log(items[i].rm_nombre);
            this.customersService.addCustomer(items[i]);
          }

        });
    }
  }

  loadChartsData() { }

  syncData() {

    if (window.navigator.onLine) {
      this.messages.push('Sync Started');
      this.ordersService
        .getData()
        .then(data => {
          for (var i = 0; i < data.length; i++) {
            var order = data[i];
            let selectedProducts = order.selectedProducts;
            var url = "http://odoo2.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarPedido&rmCustomer=" + order.customer + "&rmDateOrder=" + order.dateOrder + "&rmUserId=" + order.rmUserId + "&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
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
                var url = "http://odoo2.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarLineaPedido&order_id=" + order_id + "&rmQuantity=" + quantity + "&rmProduct_id=" + productId + "&callback=JSONP_CALLBACK";
                url = encodeURI(url);
                this.ordersService.saveOrderOnServer(url).then(data2 => {
                  console.log("rmRegistrarLineaPedido:" + data2);
                });
              }
              this.messages.push('Order with id-' + order._id + ' Uploaded ');
            });
          }
        }
        ).then(function() {
        });

      this.positionService
        .getData()
        .then(data => {
          for (var i = 0; i < data.length; i++) {
            var position = data[i];
            //var url = "http://odoo2.romilax.com/organica/back_end/rmXMLRPC.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
            var url = "http://odoo2.romilax.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmRegistrarGeolocalizacion&res_user_id=11&longitude=" + position.lat + "&latitude=" + position.lat + "&callback=JSONP_CALLBACK";
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
