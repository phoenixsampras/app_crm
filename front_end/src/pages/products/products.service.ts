import { Injectable } from "@angular/core";
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import 'rxjs/add/operator/toPromise';
import { ProductsModel } from './products.model';

@Injectable()
export class ProductsService {
	constructor(
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

	getStockDataFromServer(): Promise<any> {
		return this.jsonp.request('http://odoo2.romilax.com/organica/back_end/rmXMLRPC_stock.php?task=rmStockProductos&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json())
		.catch(this.handleError);
	}
	
	getDataFromServer(): Promise<ProductsModel> {
		return this.jsonp.request('http://odoo2.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmListaProductos&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json() as ProductsModel)
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

}
