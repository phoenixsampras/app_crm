import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';
import { PositionService } from '../orders/position.service';
import { DatabaseService } from './database.service';
import { AlertController } from 'ionic-angular';
import { SyncService } from './sync.service';
import { ProductsService } from '../products/products.service';
import { ToastController } from 'ionic-angular';
import { CustomersService } from '../clientes/customers.service';
import { CalendarService } from '../calendar/calendar.service';
import * as numeral from 'numeral';
import { LoginPage } from '../login/login';
import moment from 'moment';
import { Jsonp } from '@angular/http';


@Component({
  selector: 'sync-page',
  templateUrl: 'sync.html'
})
export class SyncPage {

  messages: any = [];
  loading: any;
  disabled = false;
  constructor(
    public toastCtrl: ToastController,
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public ordersService: OrdersService,
    public positionService: PositionService,
    public databaseService: DatabaseService,
    public productsService: ProductsService,
    public syncService: SyncService,
    public alertCtrl: AlertController,
    public customersService: CustomersService,
    public calendarService: CalendarService,
    public jsonp: Jsonp

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

  syncProductPTData() {
    let loadingCtrl = this.loadingCtrl;
    let loading = loadingCtrl.create();
    loading.present();
    setTimeout(() => {
      loading.dismiss();
    }, 5000);

    let me = this;
    this.ordersService
      .getData()
      .then(data => {
        var products = [];
        var quantity = [];
        for (var i = 0; i < data.length; i++) {
          var order = data[i];
          // Solo sincronizar pedidos no sincronizados anteriormente y con numeracion
          if (order.sync && order.numberOrder > 0) {
            //console.log(order);
            for (var j = 0; j < order.selectedProducts.length; j++) {
              var product = order.selectedProducts[j];
              //console.log(product);
              if (products[product.product.id]) {
                let q = parseInt(products[product.product.id], 10);
                let _q = parseInt(product.quantity, 10);
                products[product.product.id] = q + _q;
              } else {
                products[product.product.id] = parseInt(product.quantity, 10);
              }
              //quantity.push(product.quantity);
            }


          }
        }
        console.log(products);
        for (var k = 0; k < products.length; k++) {
          if (products[k]) {
            console.log(products[k]);
            me.productsService.updateProductPT(k, products[k]);
          }

        }
        //console.log(quantity);
        // loading.dismiss();
      });
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
    setTimeout(() => {
      loading.dismiss();
    }, 5000);

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
                  // loading.dismiss();
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
      setTimeout(() => {
        loading.dismiss();
      }, 5000);

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
                  // loading.dismiss();
                }
              }
            ]
          });
          alert1.present();

        });
    }
  }

  syncProductsStock() {
    if (window.navigator.onLine) {
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
      setTimeout(() => {
        loading.dismiss();
      }, 5000);

      this.productsService
        .getDataFromPouch('')
        .then(data => {
          let products = data;
          //var url = "http://organica.movilcrm.com/api/stock/metodo_operaciones/?token=27940227efcb4e8babd401bb51a87f98&location_id=12&location_dest_id=28&company_id=1&picking_type_id=3&selectedProducts=[{"product_id":"1","product_uom_qty":"1",},{"product_id":"2","product_uom_qty":"1",}]"

          let tokenUrl = "https://organica.movilcrm.com/api/user/get_token?"
          tokenUrl += "login=" + this.ordersService.email + "&password=" + this.ordersService.password;
          tokenUrl += '&callback=JSONP_CALLBACK';
          console.log(tokenUrl);
          let me = this;
          me.jsonp.request(tokenUrl, { method: 'Get' }).map(res => res.json()).subscribe(data => {
            console.log(data);
            let rmToken = data.token;
            var url = "https://organica.movilcrm.com/api/stock/metodo_operaciones?token=" + rmToken;
            url += "&location_id=" + me.ordersService.location_dest_id;
            url += "&location_dest_id=" + me.ordersService.location_id;
            url += "&company_id=" + me.ordersService.company_id;
            url += "&picking_type_id=" + me.ordersService.picking_type_id;
            let productsArray = [];
            console.log("Numero de Productos:" + products.length);

            if (products.length > 0) {
              for (var i = 0; i < products.length; i++) {
                let product = products[i];
                // productsArray.push({ 'product_id': product.id, 'product_uom_qty': parseFloat(product.stock,10) });
                productsArray.push({ 'product_id': product.id, 'product_uom_qty': parseFloat(product.stock) });
                console.log("Producto:" + JSON.stringify(productsArray));
              }
            } else {
              // loading.dismiss();
              console.log("No hay productos para reingresar");
              let toastCtrl = this.toastCtrl;
              let toast = toastCtrl.create({
                message: "No hay productos con saldo para reingresar.",
                duration: 3000,
                cssClass: 'toast-error',
                position: 'bottom',
              });
              toast.present();
              return;
            }
            url += "&selectedProducts=" + JSON.stringify(productsArray);
            url += '&callback=JSONP_CALLBACK';
            console.log(url);
            me.productsService.syncProductStockOnServer(encodeURI(url))
              .then(data => {
                console.log(data);
                // loading.dismiss();
              })

          });
        });
    }
  }

  loadCalendarEvents() {
    if (window.navigator.onLine) {
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
      setTimeout(() => {
        loading.dismiss();
      }, 5000);

      this.calendarService
        .getDataFromServer()
        .then(data => {
          let calendarList = data.rmListaEventos;
          var items = [];
          for (var i = 0; i < calendarList.length; i++) {
            if (calendarList[i].start_datetime) {
              items[i] = calendarList[i];
              items[i].title = calendarList[i].name;
              items[i].rm_estado = calendarList[i].rm_estado;
              items[i].startTime = moment(calendarList[i].start_datetime, "YYYY-MM-DD HH:mm:ss").toDate();
              items[i].endTime = moment(calendarList[i].start_datetime, "YYYY-MM-DD HH:mm:ss").toDate();;
              console.log(items[i]);
              this.calendarService.addCalendarEvent(items[i]);
            }
          }
          // loading.dismiss();
        });

        this.calendarService
          .getEstadoDataFromServer()
          .then(data => {
            let calendarEventEstado = data.rmListaEstadoEventos;
            // console.log(calendarEventEstado[0].id);
            var items = [];
            for (var i = 0; i < calendarEventEstado.length; i++) {
              if (calendarEventEstado[i].id) {
                items[i] = calendarEventEstado[i];
                items[i].id = calendarEventEstado[i].id;
                items[i].name = calendarEventEstado[i].name;
                console.log(items[i]);
                this.calendarService.addCalendarEstadoEvent(items[i]);
              }
            }
            // loading.dismiss();
          });

    }
  }

  syncSendCalendar () {
    if (window.navigator.onLine) {
      this.calendarService
      .getDataFromPouch()
      .then(data => {
        for (var i = 0; i < data.length; i++) {
          var event = data[i];
          //var url = "http://odoo2.romilax.com/organica/back_end/rmXMLRPC.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
          var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_calendario.php?task=rmRegistrarEvento&res_user_id="+ event.user_id +"&name="+event.name+"&rm_estado="+event.rm_estado+"&start_datetime=" + event.start_datetime + "&callback=JSONP_CALLBACK";
          url = encodeURI(url);
          this.calendarService.saveEventOnServer(url).then(data => {
            console.log('Event with id-' + event._id + ' Uploaded');
            this.messages.push('Event with id-' + event._id + ' Uploaded ');
          });
        }
      });
    }
  }

  loadChartsData() { }

  syncOrderDataMasivo() {
    if (window.navigator.onLine) {
      // this.disabled = true;
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
      setTimeout(() => {
        loading.dismiss();
      }, 5000);

      let me = this;
      this.messages.push('Sincronizando Pedidos');
      this.ordersService
        .getSyncOrderData()
        .then(data => {
          // Solo sincronizar pedidos no sincronizados anteriormente y con numeracion
          if (data.length > 0) {
            console.log(data);
            // console.log("for Pedido:" + JSON.stringify(order));
            // let selectedProducts = order.selectedProducts;
            let orders = data;
            var url = this.ordersService.getFullUrl("rmXMLRPC_pedidos.php?task=rmRegistrarPedidoMasivo");
            var postData = { "pedidos": data, "rmUserId": this.ordersService.loginId }
            let me = this;
            let url2 = url;
            let i = 1;
            // Storing url data in order to wait for the jsonp
            me.ordersService.saveOrderOnServer(url2, JSON.stringify(postData)).then(data => {
              let jsonRes = JSON.parse(data._body);
              // loading.dismiss();
              // let order_id = data[0]._body.order_id;
              if (jsonRes.status == 'success') {
                for (var j = 0; j < orders.length; j++) {
                  let _order = orders[j];
                  _order.sync = 0;
                  console.log("Pedidos Sincronizados:" + JSON.stringify(_order));
                  me.messages.push('Pedido sincronizado: ' + _order.numberOrder + ' Cliente: ' + _order.customer + ' Total: ' + _order.total);
                  me.ordersService.updateOrder(_order);
                }

              }
              // me.disabled = false;

            }, function(error) {
              // loading.dismiss();
              me.disabled = false;
            });
          } else {
            // this.disabled = false;
            // loading.dismiss();
          }

        });
    }
  }

  syncOrderData() {
    if (window.navigator.onLine) {
      this.disabled = true;
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
      setTimeout(() => {
        loading.dismiss();
      }, 5000);
      let me = this;
      this.messages.push('Sincronizando Pedidos');
      this.ordersService
        .getData()
        .then(data => {
          let flags = [];
          console.log("TODOS LOS PEDIDOS:" + JSON.stringify(data));
          for (var i = 0; i < data.length; i++) {
            flags[i] = 2;
            var order = data[i];
            // Solo sincronizar pedidos no sincronizados anteriormente y con numeracion
            if (order.sync && order.numberOrder > 0) {
              console.log("for Pedido:" + JSON.stringify(order));

              let selectedProducts = order.selectedProducts;
              var url = "https://cloud.movilcrm.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarPedido";
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
          setTimeout(function() {
            me.enableButton(flags, loading);
          }, 100);
        });
    }
  }

  //Sending customer data to server
  syncCustomerData() {
    if (window.navigator.onLine) {
      this.disabled = true;
      let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
      setTimeout(() => {
        loading.dismiss();
      }, 5000);
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
              var url = "https://cloud.movilcrm.com/organica/back_end/rmXMLRPC_clientes.php?task=rmRegistrarCliente";
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
          // setTimeout(function() {
          //   me.enableButton(flags, loading);
          // }, 100);
        });

    } else {
      this.sinInternet();
    }

  }
  enableButton(flags, loading) {
    let check = 0;
    console.log(flags);
    for (var i = 0; i < flags.length; i++) {
      if (flags[i] == 2) {
        check = 1;
        break;
      }
    }
    let me = this;
    if (check == 1) {
      setTimeout(function() {
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
