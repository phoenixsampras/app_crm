import { Component } from '@angular/core';
import { zbtprinter } from 'ionic-native';
import { ViewController, NavController, NavParams, ToastController } from 'ionic-angular';
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

	orderObj:any;
	address = '';
	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public toastCtrl: ToastController,

	) {
		this.orderObj = this.navParams.get('order');
		cordova.plugins.zbtprinter.find(
			function(result) {
				if(typeof result == 'string') {
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

	getTotal() {
		let total = 0.0;
		for(var i=0; i<this.orderObj.selectedProducts.length;i++) {
			total += this.orderObj.selectedProducts[i].product.price * this.orderObj.selectedProducts[i].quantity;
		}
		return total;
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}

	cancel(){
		this.viewCtrl.dismiss();
	}

// New function to print in zebra lang
  printOrder () {
    console.log("impresion");
    

    cordova.plugins.zbtprinter.print(this.address, "^XA^FO20,20^A0N,25,25^FDThis is a ZPL test.^FS^XZ",
      function(success) {
          alert("Zbtprinter print success: " + success);
      }, function(fail) {
          alert("Zbtprinter print fail:" + fail);
          //deferred.reject(fail);
      }
    );

  }



}
