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
    if (this.orderObj) {
      this.orderObj.confirmed = true;
      this.ordersService.updateOrder(this.orderObj);
    }
    alert("impresion");
    console.log("impresion");
    let zebra_receipt = '';
    let zebra_receipt_header = '';
    let zebra_receipt_body = '';
    let zebra_receipt_total = '';
    let zebra_receipt_footer = '';

    zebra_receipt_header = `
            ^XA
            ^MNN
            ^LL1100
            ^ASN,50
            ^FO0,30^FB580,3,0,C,0^FDORGANICA S.R.L.^FS
            ^FO0,70^FB580,3,0,C,0^FDPedidos: 4587965^FS
            ^FO0,110^FB580,3,0,C,0^FDCochabamba - Bolivia^FS
            ^CFQ
            ^FO5,180^FD Fecha: 01/01/2017^FS
            ^FO5,210^FD Vendedor: Hermenegildo^FS
            ^FO5,240^FD Cliente: Supermercado Ic-Norte S.R.L.^FS
            ^FO5,270^FD NIT: 78415465416341^FS
            ^FO5,300^FD Direccion: 78415465416341^FS
            ^FO5,330^FD Telefono: 78415465416341^FS
            ^FO5,360^FD Celular: 78415465416341^FS

            ^CFF,20
            ^LRY
            ^FO0,400^GB600,40,30^FS
            ^FO0,410^FDPRODUCTO       CANT PRECIO    TOTAL^FS
            `;
    zebra_receipt_body = `
            ^CFF,20

            ^FO0,450
            ^FB250,5,0,L,0
            ^FDPapas Fritas a b c d^FS

            ^FO250,450
            ^FB60,5,0,R,0
            ^FD999^FS

            ^FO320,450
            ^FB100,5,0,R,0
            ^FD999.99^FS

            ^FO410,450
            ^FB150,5,0,R,0
            ^FD9999.99^FS



            ^FO0,510
            ^FB250,5,0,L,0
            ^FDPapas Fritas 2 3 a b c d^FS

            ^FO250,510
            ^FB60,5,0,R,0
            ^FD99^FS

            ^FO320,510
            ^FB100,5,0,R,0
            ^FD99.99^FS

            ^FO410,510
            ^FB150,5,0,R,0
            ^FD999.99^FS
            `;

    zebra_receipt_total = `
            ^FO5,560^GB600,3,3^FS
            ^FO0,570
            ^FB250,5,0,L,0
            ^FDGRAN TOTAL^FS

            ^FO250,570
            ^FB60,5,0,R,0
            ^FD99^FS

            ^FO410,570
            ^FB150,5,0,R,0
            ^FD999.99^FS
            `;

    zebra_receipt_footer = `
            ^CFR,15
            ^FO5,720^GB600,1,1^FS
            ^FO5,700^FB580,3,0,C,0^FDFirma Cliente^FS
            ^FO5,870^GB600,1,1^FS
            ^FO5,850^FB580,3,0,C,0^FDFirma Vendedor^FS
            ^FO5,900^FB580,3,0,C,0^FDGracias por su Compra!!^FS
            ^FO5,930^FB580,3,0,C,0^FDFelices Fiestas!!^FS
            ^FO0,960^FB580,3,0,C,0^FDReclamos: 4587967^FS
            ^XZ
            `;

    // zebra_receipt = zebra_receipt_header + zebra_receipt_body + zebra_receipt_total + zebra_receipt_footer;
    zebra_receipt = 'sd';
    alert(this.ordersService.macAddress);
    // cordova.plugins.zbtprinter.print(this.ordersService.macAddress, "^XA^FO20,20^A0N,25,25^FD " + zebra_receipt + " ^FS^XZ",
    cordova.plugins.zbtprinter.print(this.ordersService.macAddress, zebra_receipt,
      function(success) {
        alert("Zbtprinter print success: " + success);
      }, function(fail) {
        alert("Zbtprinter print fail:" + fail);
        //deferred.reject(fail);
      }
    );

  }

  findPrinter() {
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
