import { Component } from '@angular/core';
import { NavController, LoadingController , ModalController} from 'ionic-angular';
import { OrdersService } from './orders.service';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/Rx';
import { AddOrderPage } from '../add-order/add-order';
import { PrintOrderPage } from '../print-order/print-order';
import { PositionService } from './position.service';

@Component({
  selector: 'orders-page',
  templateUrl: 'orders.html'
})
export class OrdersPage {

	loading: any;
	ordersList: any = [];
	constructor(
		public nav: NavController,
		public loadingCtrl: LoadingController,
		public ordersService: OrdersService,
		public positionService: PositionService,
		public modalCtrl: ModalController,
		
	) {
		
	}

	getTotal() {
		let total = 0;
		for(var i=0; i< this.ordersList.length;i++) {
			total += this.ordersList[i].total;
		}
		return total;
	}
	
	editOrder(item) {
		this.nav.push(AddOrderPage, {'order' : item});
	}
	
	printOrder(item) {
		let modal = this.modalCtrl.create(PrintOrderPage, { 'order': item });
		modal.onDidDismiss(data => {
			if(data){
                //this.selectedProducts.push(data);
            }
		});
		modal.present();
	}
	
	goToAddOrder() {
		this.nav.push(AddOrderPage, {'order' : ''});
	}

	ionViewDidEnter() {
		this.ordersService
		.getData()
		.then(data => {
			this.ordersList = data;
		});
	}



}
