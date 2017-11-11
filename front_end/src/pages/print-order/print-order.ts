import { Component } from '@angular/core';
import { ViewController, NavController, NavParams, ToastController } from 'ionic-angular';
/**
 * Generated class for the SkillAutocompletePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'print-order-page',
  templateUrl: 'print-order.html',
})
export class PrintOrderPage {

	orderObj:any;

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public toastCtrl: ToastController,

	) {
		this.orderObj = this.navParams.get('order');

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

}
