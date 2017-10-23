import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';
import { PositionService } from '../orders/position.service';
import { DatabaseService } from '../orders/database.service';

@Component({
  selector: 'sync-page',
  templateUrl: 'sync.html'
})
export class SyncPage {

	messages :any = [];
	loading:any;
	constructor(
		public nav: NavController,
		public loadingCtrl: LoadingController,
		public ordersService: OrdersService,
		public positionService: PositionService,
		public databaseService: DatabaseService,
	) {
		
	}
	
	
	wipeData() {
		this.databaseService.deleteDB();
	}
	
	syncData() {
		
		if(window.navigator.onLine){
			
			this.ordersService
			.getData()
			.then(data => {
				for(var i = 0; i < data.length; i++) {
					var order = data[i];
					var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
					url = encodeURI(url);
					this.ordersService.saveOrderOnServer(url).then(data=>{
						console.log('order with id-' + order._id + ' Uploaded ');
						this.messages.push('Order with id-' + order._id + ' Uploaded ');
					});
				}
			});
			this.positionService
			.getData()
			.then(data => {
				for(var i = 0; i < data.length; i++) {
					var position = data[i];
					//var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC.php?task=rmRegistrarPedido&rmCustomer="+order.customer+"&rmDateOrder="+ order.dateOrder +"&rmNote=" + order.notes + "&callback=JSONP_CALLBACK";
					var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC_calendario.php?task=rmRegistrarGeolocalizacion&res_user_id=11&longitude=" + position.lat + "&latitude=" + position.lat + "&callback=JSONP_CALLBACK";
					url = encodeURI(url);
					this.positionService.savePositionOnServer(url).then(data=>{
						console.log('Position with id-' + position._id + ' Uploaded');
						this.messages.push('Position with id-' + position._id + ' Uploaded ');
					});
				}
			});	
	
		} else {
			alert('Device Not Online');
		}
	}

}
