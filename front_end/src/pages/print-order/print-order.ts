import { Component } from '@angular/core';
// import { zbtprinter } from 'ionic-native';
import { ViewController, NavController, NavParams, ToastController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';

/**
 * Generated class for the SkillAutocompletePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
declare var cordova;
@Component({
  selector: 'print-order-page',
  templateUrl: 'print-order.html',
})
export class PrintOrderPage {

  orderObj: any;
  address = '';
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
	public ordersService: OrdersService,

  ) {
    this.orderObj = this.navParams.get('order');

  }

  getTotal() {
    let total = 0.0;
    for (var i = 0; i < this.orderObj.selectedProducts.length; i++) {
      total += this.orderObj.selectedProducts[i].product.price * this.orderObj.selectedProducts[i].quantity;
    }
    return total;
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  // New function to print in zebra lang
	printOrder() {
		if(this.orderObj) {
			this.orderObj.confirmed = true;
			this.ordersService.updateOrder(this.orderObj);			
		}
		alert("impresion");
		console.log("impresion");
		let zebra_receipt = '';

    zebra_receipt = `

          ^XA
          ^ASN,50
          ^FO0,10^FB600,3,0,C,0^FD\&ORGANICA S.R.L.^FS 
          ^CF0,35
          ^FO0,60^FB600,3,0,C,0^FD\&Pedidos: 4587965^FS
          ^FO0,90^FB600,3,0,C,0^FD\&Reclamos: 4587967^FS
          ^FO0,120^FB600,3,0,C,0^FD\&Cochabamba - Bolivia^FS

          ^FO10,190^FD Fecha: 01/01/2017^FS
          ^FO10,220^FD Vendedor: Hermenegildo^FS
          ^FO10,250^FD Razon Social: Supermercado Ic-Norte S.R.L.^FS
          ^FO10,280^FD NIT: 78415465416341^FS

          ^CF0,35
          ^FO10,350^FD CANTIDAD  PRODUCTO                     PRECIO   TOTAL ^FS
          ^FO10,380^FD       10  Papas Fritas                                  1.25   10.25 ^FS
          ^FO10,410^FD       10  Charke                                          1.00   10.00 ^FS
          ^FO10,440^FD       10  Tunta Confitada                            1.00   10.00 ^FS
          ^FO10,470^FD       30  TOTAL                                                    30.25 ^FS
          ^FO10,550^FD Gracias por su Compra!! Feliz Navidad!!^FS

          ^XZ

            `;

	alert(this.ordersService.macAddress);
  // cordova.plugins.zbtprinter.print(this.ordersService.macAddress, "^XA^FO20,20^A0N,25,25^FD " + zebra_receipt + " ^FS^XZ",
    cordova.plugins.zbtprinter.print(this.ordersService.macAddress, zebra_receipt ,
      function(success) {
        alert("Zbtprinter print success: " + success);
      }, function(fail) {
        alert("Zbtprinter print fail:" + fail);
        //deferred.reject(fail);
      }
    );

  }

  findOrder() {
    cordova.plugins.zbtprinter.find(
      function(result) {
        if (typeof result == 'string') {
          this.address = result;
        } else {
          this.address = result.address;
        }
        alert('Zbtprinter: connect success: ' + this.address);
      }, function(error) {
        alert('Zbtprinter: connect fail: ' + error);
      }
    );
  }

}
