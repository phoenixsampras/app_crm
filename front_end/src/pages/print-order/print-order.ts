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
    alert("impresion");
    console.log("impresion");
    let zebra_receipt = '';

    zebra_receipt = " \
            ^XA \
            \
            ^FX Top secsssstion with company logo, name and address. \
            ^CF0,60 \
            ^FO50,50^GB100,100,100^FS \
            ^FO75,75^FR^GB100,100,100^FS \
            ^FO88,88^GB50,50,50^FS \
            ^FO220,50^FDInternational Shipping, Inc.^FS \
            ^CF0,40 \
            ^FO220,100^FD1000 Shipping Lane^FS \
            ^FO220,135^FDShelbyville TN 38102^FS \
            ^FO220,170^FDUnited States (USA)^FS \
            ^FO50,250^GB700,1,3^FS \
            \
            ^FX Second section with recipient address and permit information. \
            ^CFA,30 \
            ^FO50,300^FDJohn Doe^FS \
            ^FO50,340^FD100 Main Street^FS \
            ^FO50,380^FDSpringfield TN 39021^FS \
            ^FO50,420^FDUnited States (USA)^FS \
            ^CFA,15 \
            ^FO600,300^GB150,150,3^FS \
            ^FO638,340^FDPermit^FS \
            ^FO638,390^FD123456^FS \
            ^FO50,500^GB700,1,3^FS \
            \
            ^FX Third section with barcode. \
            ^BY5,2,270 \
            ^FO175,550^BC^FD1234567890^FS \
            \
            ^FX Fourth section (the two boxes on the bottom). \
            ^FO50,900^GB700,250,3^FS \
            ^FO400,900^GB1,250,3^FS \
            ^CF0,40 \
            ^FO100,960^FDShipping Ctr. X34B-1^FS \
            ^FO100,1010^FDREF1 F00B47^FS \
            ^FO100,1060^FDREF2 BL4H8^FS \
            ^CF0,190 \
            ^FO485,965^FDCA^FS \
            \
            ^XZ \
            ";

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
