import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';
import { PositionService } from '../orders/position.service';
import { DatabaseService } from './database.service';
import { AlertController } from 'ionic-angular';
import { SyncService } from './sync.service';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../clientes/customers.service';
import { CalendarService } from '../calendar/calendar.service';
import { LoginPage } from '../login/login';
import moment from 'moment';

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
    public customersService: CustomersService,
    public calendarService: CalendarService

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
    let loadingCtrl = this.loadingCtrl;
    let loading = loadingCtrl.create();
    loading.present();
    this.databaseService.deleteDB();
    loading.dismiss();
  }

  // Load products with stock from server
  loadProducts() {
    let loadingCtrl = this.loadingCtrl;
    let loading = loadingCtrl.create();
    loading.present();
    if (window.navigator.onLine) {
      this.productsService
        .getDataFromServer()
        .then(data => {
          let items = data.rmStockProductos;
          for (var i = 0; i < items.length; i++) {
            console.log(items[i]);
            this.productsService.addProduct(items[i]);
          }
          loading.dismiss();
        });
    }
  }

  // Deprecated
  // stockProducts() {
  // 	if (window.navigator.onLine) {
  // 		this.productsService
  // 		.getStockDataFromServer()
  // 		.then(data => {
  //
  // 			let items = data.rmStockProductos;
  // 			for (var i = 0; i < items.length; i++) {
  // 				console.log(items[i]);
  // 				this.productsService.stockProduct(items[i].id, items[i].quantity);
  // 			}
  // 		});
  // 	}
  // }

  loadCustomers() {
    if (window.navigator.onLine) {
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();

      this.customersService
        .getDataFromServer()
        .then(data => {
          let items = data.rmListaClientes;
          // console.log("rmListaClientes:" + JSON.stringify(items));
          for (var i = 0; i < items.length; i++) {
            //console.log("rmListaClientes:" + JSON.stringify(items[i]));
            //console.log(items[i].rm_nombre);
            items[i].property_product_pricelist = items[i].property_product_pricelist[1];
            items[i].user_id = items[i].user_id[0];
            items[i].newCustomer = 0;
            items[i].name = !items[i].name ? "" : items[i].name;
            items[i].email = !items[i].email ? "" : items[i].email;
            items[i].street = !items[i].street ? "" : items[i].street;
            items[i].phone = !items[i].phone ? "" : items[i].phone;
            items[i].mobile = !items[i].mobile ? "" : items[i].mobile;
            items[i].rm_longitude = !items[i].rm_longitude ? "" : items[i].rm_longitude;
            items[i].rm_latitude = !items[i].rm_latitude ? "" : items[i].rm_latitude;
            items[i].razon_social = !items[i].razon_social ? "" : items[i].razon_social;
            items[i].nit = !items[i].nit ? "" : items[i].nit;
            items[i].rm_sync_date_time = !items[i].rm_sync_date_time ? "" : items[i].rm_sync_date_time;
            console.log('loadCustomers:' + JSON.stringify(items[i]));
            this.customersService.addCustomer(items[i]);
          }
          loading.dismiss();
        });
    }
  }

  loadCalendarEvents() {
    if (window.navigator.onLine) {
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
      var data = this.calendarService
        .getDataFromServer()
        .then(data => {
          let calendarList = data.rmListaEventos;
          var items = [];
          for (var i = 0; i < calendarList.length; i++) {
            if (calendarList[i].start_datetime) {
              items[i] = calendarList[i];
              items[i].title = calendarList[i].name;
              items[i].startTime = moment(calendarList[i].start_datetime, "YYYY-MM-DD HH:mm:ss").toDate();
              items[i].endTime = moment(calendarList[i].start_datetime, "YYYY-MM-DD HH:mm:ss").toDate();;
              console.log(items[i]);
              this.calendarService.addCalendarEvent(items[i]);
            }
          }
          loading.dismiss();
        });
    }
  }

  loadChartsData() { }

  // syncData() {
  // 	if (window.navigator.onLine) {
  // 		let loadingCtrl = this.loadingCtrl;
  // 		let loading = loadingCtrl.create();
  // 		loading.present();
  // 		this.messages.push('Sync Started');
  /*this.ordersService
  .getData()
  .then(data => {
    for (var i = 0; i < data.length; i++) {
      var order = data[i];
      let selectedProducts = order.selectedProducts;
      var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarPedido&rmCustomer=" + order.customer + "&rmDateOrder=" + order.dateOrder + "&rmUserId=" + order.rmUserId + "&rmNote=" + order.notes + "&rmUserId=" + order.rmUserId + "&latitude=" + order.latitude + "&longitude=" + order.longitude  + "&confirmed=" + order.confirmed +"&callback=JSONP_CALLBACK";
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
          var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarLineaPedido&order_id=" + order_id + "&rmQuantity=" + quantity + "&rmProduct_id=" + productId + "&callback=JSONP_CALLBACK";
          url = encodeURI(url);
          this.ordersService.saveOrderOnServer(url).then(data2 => {
            console.log("rmRegistrarLineaPedido:" + data2);
          });
        }
        this.messages.push('Order with id-' + order._id + ' Uploaded ');
      });
    }
  });

  this.positionService
  .getData()
  .then(data => {
    for (var i = 0; i < data.length; i++) {
      var position = data[i];
      //var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
      var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmRegistrarGeolocalizacion&res_user_id=11&longitude=" + position.lat + "&latitude=" + position.lat + "&res_user_id=" + position.user_id  + "&callback=JSONP_CALLBACK";
      url = encodeURI(url);
      this.positionService.savePositionOnServer(url).then(data => {
        console.log('Position with id-' + position._id + ' Uploaded');
        this.messages.push('Position with id-' + position._id + ' Uploaded ');
      });
    }
  });
  this.calendarService
  .getDataFromPouch()
  .then(data => {
    for (var i = 0; i < data.length; i++) {
      var event = data[i];
      //var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
      var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_calendario.php?task=rmRegistrarEvento&res_user_id="+ event.user_id +"&name="+event.name+"&start_datetime=" + event.start_datetime + "&callback=JSONP_CALLBACK";
      url = encodeURI(url);
      this.calendarService.saveEventOnServer(url).then(data => {
        console.log('Event with id-' + event._id + ' Uploaded');
        this.messages.push('Event with id-' + event._id + ' Uploaded ');
      });
    }
  });*/

  //Sending customer data to server
  syncCustomerData() {
    if (window.navigator.onLine) {
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
      this.messages.push('<b>Sincronizando Clientes</b>');
      this.customersService
        .getDataFromPouch()
        .then(data => {
          for (var i = 0; i < data.length; i++) {
            var customer = data[i];
            if (customer.newCustomer > 0) {
              // console.log("nuevo cliente:" + JSON.stringify(customer));
              var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_clientes.php?task=rmRegistrarCliente";
              url += "&user_id=" + customer.user_id;
              url += "&name=" + customer.name;
              url += "&street=" + customer.street;
              url += "&phone=" + customer.phone;
              url += "&mobile=" + customer.mobile;
              url += "&email=" + customer.email;
              url += "&nit=" + customer.nit;
              url += "&razon_social=" + customer.razon_social;
              url += "&rm_longitude=" + customer.rm_longitude;
              url += "&rm_latitude=" + customer.rm_latitude;
              url += "&photo_m=" + customer.photo_m;
              url += "&rm_sync_date_time=" + customer.rm_sync_date_time;
              if (customer.newCustomer ==2) {
                url += "&id=" + customer.id;
              }
              url += "&callback=JSONP_CALLBACK";
              // console.log(url);
              let operacion = customer.newCustomer;
              url = encodeURI(url);
              this.customersService.saveCustomerOnServer(url).then(data => {
                if (operacion == 1) {
                  this.messages.push('Nuevo Cliente:' + customer.name);
                  this.messages.push(JSON.stringify(customer));
                } else if (operacion == 2) {
                  this.messages.push('Editar Cliente:' + customer.name);
                  this.messages.push(JSON.stringify(customer));
                }
              });
            }
          }
        });
      loading.dismiss();
    } else {
      this.sinInternet();
      // alert('Device Not Online');
    }
  }

  ionViewWillLoad() {
    if (!this.ordersService.loginId) {
      this.nav.setRoot(LoginPage);
    }
  }

}
