import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from './orders.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/Rx';
import { AddOrderPage } from '../add-order/add-order';

@Component({
  selector: 'orders-page',
  templateUrl: 'orders.html'
})
export class OrdersPage {

	loading:any;
	ordersList:any = [];
	constructor(
		public nav: NavController,
		public loadingCtrl: LoadingController,
		public ordersService: OrdersService,
	) {
		let ordersService1 = this.ordersService;
		window.addEventListener("online", function(e) {
			ordersService1
			.getData()
			.then(data => {
				for(var i = 0; i < data.length; i++) {
					var order = data[i];
					var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
					url = encodeURI(url);
					ordersService1.saveOrderOnServer(url).then(data=>{
						console.log('order with id-' + order._id + 'uploaded');
						ordersService1.deleteOrder(order);
					});
				}
			});
		}, false);

		window.addEventListener("offline", function(e) {

		}, false);
	}

	goToAddOrder() {
		this.nav.push(AddOrderPage);
	}

	ionViewDidEnter() {
		this.loading = this.loadingCtrl.create();
		this.loading.present();
		this.ordersService
		.getData()
		.then(data => {
			this.ordersList = data;
			if(window.navigator.onLine){
				for(var i = 0; i < data.length; i++) {
					var order = data[i];
					var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
					url = encodeURI(url);
					this.ordersService.saveOrderOnServer(url).then(data=>{
						console.log('order with id-' + order._id + 'uploaded');
						this.ordersService.deleteOrder(order);
					});
				}
				this.ordersList = [];
			}
			this.loading.dismiss();
		});

	}



}
