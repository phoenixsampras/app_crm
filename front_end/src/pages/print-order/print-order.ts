import { Component } from '@angular/core';
// import { zbtprinter } from 'ionic-native';
import { ViewController, NavController, NavParams, ToastController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';
import moment from 'moment';

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
  totalProducts = 0;
  // address = '';
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
      moment.lang('es-us');
      this.orderObj.confirmed = true;
      this.ordersService.updateOrder(this.orderObj);

      // alert("impresion");
      console.log("impresion");
      let zebra_receipt = '';
      let zebra_receipt_header = '';
      let zebra_receipt_body = '';
      let zebra_receipt_total = '';
      let zebra_receipt_footer = '';

      let zebra_receipt_body_height = 450;
      let zebra_receipt_body_total_height = 0;
      let zebra_receipt_total_height = 450;
      let zebra_receipt_footer_height = 600;

      console.log("orderObj:" + JSON.stringify(this.orderObj));
      // $window.orderObj = this.orderObj;

      zebra_receipt_header = `
              ^XA
              ^MNN
              ^LL1100
              ^ASN,50
              ^FO0,30^FB580,3,0,C,0^FDORGANICA S.R.L.^FS
              ^FO0,70^FB580,3,0,C,0^FDPedidos: 4587965^FS
              ^FO0,110^FB580,3,0,C,0^FDCochabamba - Bolivia^FS
              ^CFQ
              ^FO5,180^FD Fecha: ` + moment(this.orderObj.dateOrder).format('Do MMMM YYYY, h:mm a') + `^FS
              ^FO5,210^FD Vendedor: Hermenegildo^FS
              ^FO5,240^FD Cliente: ` + this.orderObj.customerObj.rm_nombre + `^FS
              ^FO5,270^FD NIT: 78415465416341^FS
              ^FO5,300^FD Direccion: ` + this.orderObj.customerObj.rm_direccion + `^FS
              ^FO5,330^FD Telefono: ` + this.orderObj.customerObj.rm_telefono + `^FS
              ^FO5,360^FD Celular: ` + this.orderObj.customerObj.rm_celular + `^FS

              ^CFF,20
              ^LRY
              ^FO0,400^GB600,40,30^FS
              ^FO0,410^FDPRODUCTO       CANT PRECIO    TOTAL^FS
              ^CFQ
              `;

      for (var i = 0; i < this.orderObj.selectedProducts.length; i++) {
        // console.log("dasda" + JSON.stringify(this.orderObj.selectedProducts[i]['product']['product']));
        // console.log("dasda" + JSON.stringify(this.orderObj.selectedProducts[i]));
        let productCountLetters = this.orderObj.selectedProducts[i]['product']['product'].length;
        console.log("productCountLetters:" + productCountLetters);
        zebra_receipt_body += `
              ^FO0,` + zebra_receipt_body_height + `
              ^FB250,5,0,L,0
              ^FD` + this.orderObj.selectedProducts[i]['product']['product'] + `^FS

              ^FO250,` + zebra_receipt_body_height + `
              ^FB60,5,0,R,0
              ^FD` + this.orderObj.selectedProducts[i]['quantity'].toLocaleString('en-US') + `^FS

              ^FO320,` + zebra_receipt_body_height + `
              ^FB100,5,0,R,0
              ^FD` + this.orderObj.selectedProducts[i]['product']['price'].toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + `^FS

              ^FO410,` + zebra_receipt_body_height + `
              ^FB150,5,0,R,0
              ^FD` + (this.orderObj.selectedProducts[i]['product']['price'] * this.orderObj.selectedProducts[i]['quantity']).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + `^FS
              `;
        zebra_receipt_body_height = zebra_receipt_body_height + 30;
        zebra_receipt_body_total_height += 30;
        if (productCountLetters > 22) {
          zebra_receipt_body_total_height += 30;
        }
      }

      zebra_receipt_total_height += zebra_receipt_body_total_height;

      zebra_receipt_total = `
              ^FO5,` + (zebra_receipt_total_height - 5) + `^GB600,3,3^FS
              ^FO0,` + zebra_receipt_total_height + `
              ^FB250,5,0,L,0
              ^FDGRAN TOTAL^FS

              ^FO250,` + zebra_receipt_total_height + `
              ^FB60,5,0,R,0
              ^FD^FS

              ^FO410,` + zebra_receipt_total_height + `
              ^FB150,5,0,R,0
              ^FD` +this.orderObj.total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + `^FS
              `;


      zebra_receipt_footer_height += zebra_receipt_body_total_height;
      zebra_receipt_footer = `
              ^CFR,15
              ^FO5,` + ( zebra_receipt_footer_height -15 ) + `^GB600,1,1^FS
              ^FO5,` + zebra_receipt_footer_height + `^FB580,3,0,C,0^FDFirma Cliente^FS
              ^FO5,` + ( zebra_receipt_footer_height + 140 ) + `^GB600,1,1^FS
              ^FO5,` + ( zebra_receipt_footer_height + 150 ) + `^FB580,3,0,C,0^FDFirma Vendedor^FS
              ^FO5,` + ( zebra_receipt_footer_height + 200 ) + `^FB580,3,0,C,0^FDGracias por su Compra!!^FS
              ^FO5,` + ( zebra_receipt_footer_height + 230 ) + `^FB580,3,0,C,0^FDFelices Fiestas!!^FS
              ^FO0,` + ( zebra_receipt_footer_height + 260 ) + `^FB580,3,0,C,0^FDReclamos: 4587967^FS
              ^XZ
              `;

      zebra_receipt = zebra_receipt_header + zebra_receipt_body + zebra_receipt_total + zebra_receipt_footer;
      // zebra_receipt = 'sd';
      console.log("zebra_receipt_header:" + zebra_receipt_header);
      console.log("zebra_receipt_body:" + zebra_receipt_body);
      console.log("zebra_receipt_total:" + zebra_receipt_total);
      console.log("zebra_receipt_footer:" + zebra_receipt_footer);
      console.log("zebra_receipt_body_height:" + zebra_receipt_body_height);
      console.log("zebra_receipt_body_total_height:" + zebra_receipt_body_total_height);
      console.log("zebra_receipt_total_height:" + zebra_receipt_total_height);
      console.log("zebra_receipt_footer_height:" + zebra_receipt_footer_height);
      console.log("zebra_receipt:" + zebra_receipt);
      //alert(this.ordersService.macAddress);
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
