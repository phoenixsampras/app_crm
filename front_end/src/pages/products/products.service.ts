import { Injectable } from "@angular/core";
// import { NavController, LoadingController } from 'ionic-angular';
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import 'rxjs/add/operator/toPromise';
import { OrdersService } from '../orders/orders.service';
import { LoginPage } from '../login/login';
import { ProductsModel } from './products.model';

@Injectable()
export class ProductsService {
	constructor(
		// public nav: NavController,
		public ordersService: OrdersService,
		public jsonp: Jsonp,
		private databaseService: DatabaseService,
	) {

	}

	stockProduct(id, quantity) {
		return this.databaseService.stockProduct(id, quantity);
	}

	updateProduct(product) {
		this.databaseService.updateProduct(product);
	}

	addProduct(product) {
		this.databaseService.addProduct(product);
	}

	// Deprecated
	// getStockDataFromServer(): Promise<any> {
	// 	return this.jsonp.request('http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_stock.php?task=rmStockProductos&callback=JSONP_CALLBACK',{method:'Get'})
	// 	.toPromise()
	// 	.then(response => response.json())
	// 	.catch(this.handleError);
	// }

	getDataFromServer(): Promise<ProductsModel> {
		let user_id = this.ordersService.loginId;
		let url = 'http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_stock.php?task=rmStockProductos&user_id='+user_id+'&callback=JSONP_CALLBACK'
		console.log(url);
		return this.jsonp.request('http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_stock.php?task=rmStockProductos&user_id='+user_id+'&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json() as ProductsModel)
		.catch(this.handleError);
	}
	
	syncProductStockOnServer(url): Promise<any> {
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response.json())
		.catch(this.handleError);
	}

	getDataFromPouch(searchTerm): Promise<any> {

		return this.databaseService.getAllProducts(searchTerm)
		.then(response => response)
		.catch(this.handleError);

	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

	ionViewWillLoad() {
		if(!this.ordersService.loginId) {
			// this.nav.setRoot(LoginPage);
		}
	}

}
