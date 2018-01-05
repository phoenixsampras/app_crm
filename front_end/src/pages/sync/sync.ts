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
import { Lock } from 'semaphore-async-await';

@Component({
  selector: 'sync-page',
  templateUrl: 'sync.html'
})
export class SyncPage {

  messages: any = [];
  loading: any;
  lock = new Lock();
  disabled = false;
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
	this.ordersService.resetConfirmedOrdersCount();
    this.messages.push('Toda la informacion en el Dispositivo fue eliminada.');
    loading.dismiss();
  }

  // Load products with stock from server
  loadProducts() {
    let loadingCtrl = this.loadingCtrl;
    let loading = loadingCtrl.create();
    loading.present();
	let alertCtrl = this.alertCtrl;

    if (window.navigator.onLine) {
      this.productsService
        .getDataFromServer()
        .then(data => {
          let items = data.rmStockProductos;
		  let alert1 = alertCtrl.create({
				title: 'Confirmar sobreescritura',
				message: '¿Realmente desea sobrescribir los datos del productos?',
				buttons: [
					{
						text: 'Cancelar',
						role: 'cancel',
						handler: () => {
							console.log('Cancel clicked');
						}
					},
					{
						text: 'Confirmar',
						handler: () => {
							for (var i = 0; i < items.length; i++) {
								this.productsService.addProduct(items[i]);
							  }
							  this.messages.push('Productos cargados:' + i);
							  loading.dismiss();

						}
					}
				]
			});
			alert1.present();

        });
    }
  }

  loadCustomers() {
    if (window.navigator.onLine) {
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();

      let alertCtrl = this.alertCtrl;

	  this.customersService
        .getDataFromServer()
        .then(data => {
          let items = data.rmListaClientes;
          // console.log("rmListaClientes:" + JSON.stringify(items));
		  let alert1 = alertCtrl.create({
				title: 'Confirmar sobreescritura',
				message: '¿Realmente desea sobrescribir los datos del clientes?',
				buttons: [
					{
						text: 'Cancelar',
						role: 'cancel',
						handler: () => {
							console.log('Cancel clicked');
						}
					},
					{
						text: 'Confirmar',
						handler: () => {
							if (Object.keys(items).length > 0) {
								for (var i = 0; i < items.length; i++) {
								  //console.log("rmListaClientes:" + JSON.stringify(items[i]));
								  items[i].property_product_pricelist = items[i].property_product_pricelist[0];
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
								  // console.log('loadCustomers:' + JSON.stringify(items[i]));
								  this.customersService.addCustomer(items[i]);
								}
								this.messages.push('Total clientes cargados:' + i);
							  } else {
								this.messages.push('No hay clientes asignados a este usuario');
							  }
							  loading.dismiss();
						}
					}
				]
			});
			alert1.present();

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

  syncOrderData() {
    if (window.navigator.onLine) {
      this.disabled = true;
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
	  let me = this;
      this.messages.push('Sincronizando Pedidos');
      this.ordersService
        .getData()
        .then(data => {
			let flags = [];
			for (var i = 0; i < data.length; i++) {
				flags[i] = 2;
				var order = data[i];
            // Solo sincronizar pedidos no sincronizados anteriormente y con numeracion
            if (order.sync && order.numberOrder > 0) {
              console.log("for Pedido:" + JSON.stringify(order));

              let selectedProducts = order.selectedProducts;
              var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarPedido";
              url += "&rmCustomer=" + order.customerObj.id;
              url += "&rmDateOrder=" + order.dateOrder;
              url += "&rmUserId=" + order.rmUserId;
              url += "&rmNote=" + order.notes;
              url += "&rmUserId=" + order.rmUserId;
              url += "&latitude=" + order.latitude;
              url += "&longitude=" + order.longitude;
              url += "&confirmed=" + order.confirmed;
              url += "&numberOrder=" + order.numberOrder;
              url += "&selectedProducts=" + JSON.stringify(order.selectedProducts);
              url += "&callback=JSONP_CALLBACK";
              url = encodeURI(url);
              let me = this;
              let _order = order;
              let url2 = url;
			  // Storing url data in order to wait for the jsonp
			  me.ordersService.saveOrderOnServer(url2, i).then(data => {
				console.log("datatatatta:" + JSON.stringify(data));
				let order_id = data[0]._body.order_id;
				if (order_id) {
				  me.messages.push('Pedido creado id:' + order_id + ", _id:" + order._id);
				} else {
				  me.messages.push('Pedido no pudo ser creado');
				  return false;
				}
				//Desactivar la sincronizacion para ese pedido
				// _order.sync = 0;
				// console.log("order.sync:" + JSON.stringify(order));
				// me.ordersService.updateOrder(_order);
				flags[data[1]] = 1;
			  });
            } else {
				flags[i] = 1;
			}
          }
			setTimeout(function(){
				me.enableButton(flags, loading);
			}, 100);
        });
    }
  };

  //Sending customer data to server
  syncCustomerData() {
    if (window.navigator.onLine) {
      this.disabled = true;
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
	  let me = this;

	  this.messages.push('Sincronizando Clientes');
      this.customersService
        .getUploadDataFromPouch()
        .then(data => {
          // console.log("DATA"+JSON.stringify(data));
			let flags = [];
			for (var i = 0; i < data.length; i++) {
				flags[i] = 2;
				let customer_newCustomer = data[i].newCustomer;
				if (parseInt(customer_newCustomer) > 0) {
					var customer = data[i];
				  // console.log("xxxxxxxxxxxxxx" + JSON.stringify(customer));
				  var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_clientes.php?task=rmRegistrarCliente";
				  url += "&user_id=" + customer.user_id;
				  url += "&name=" + customer.name;
				  url += "&street=" + customer.street;
				  url += "&phone=" + customer.phone;
				  url += "&mobile=" + customer.mobile;
				  url += "&email=" + customer.email;
				  url += "&nit=" + customer.nit;
				  url += "&property_product_pricelist=" + customer.property_product_pricelist;
				  url += "&razon_social=" + customer.razon_social;
				  url += "&rm_longitude=" + customer.rm_longitude;
				  url += "&rm_latitude=" + customer.rm_latitude;
				  url += "&photo_m=" + customer.photo_m;
				  url += "&rm_sync_date_time=" + customer.rm_sync_date_time;
				  if (customer.newCustomer == 2) {
					url += "&id=" + customer.id;
				  }
					url += "&callback=JSONP_CALLBACK";
					url = encodeURI(url);
					let operacion = customer;
					let url2 = url; //trensfer value to a function
					me.customersService.saveCustomerOnServer(url2, operacion, i).then(data => {
						 console.log(data);
						if (data[0]._body.status == 'success') {
						  if (operacion.newCustomer == 1) {
							me.messages.push('Nuevo Cliente:' + operacion.name);
							me.messages.push(JSON.stringify(operacion));
							console.log("Nuevo cliente:" + JSON.stringify(data));
							// TODO the new customer his new SERVER ID
							// operacion.id = data[0]._body.partner_id;
						  } else if (operacion.newCustomer == 2) {
							me.messages.push('Editar Cliente:' + operacion.name);
							me.messages.push(JSON.stringify(operacion));
							console.log("Editar cliente:" + JSON.stringify(data));
						  }
						  //resetear el estatus
						  operacion.newCustomer = 0;
						  // console.log(operacion);
						  me.customersService.updateCustomer(operacion);
							flags[data[2]] = 1;
						}
					});

				}
			}
			setTimeout(function(){
				me.enableButton(flags, loading);
			}, 100);
        });

    } else {
      this.sinInternet();
    }
  
  }
	enableButton(flags, loading) {
		let check = 0;
		console.log(flags);
		for(var i = 0; i < flags.length; i++) {
			if(flags[i] == 2) {
				check = 1;
				break;
			}
		}
		let me = this;
		if(check == 1) {
			setTimeout(function(){
				me.enableButton(flags, loading);
			}, 100);
		} else {
			this.disabled = false;
			loading.dismiss();
		}
	}
	ionViewWillLoad() {
		if (!this.ordersService.loginId) {
			this.nav.setRoot(LoginPage);
    }
  }
}
