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

	addProduct(product) {
		 this.databaseService.addProduct(product);
	}

	getDataFromServer(): Promise<ProductsModel> {
		return this.jsonp.request('http://odoo.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmListaProductos&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json() as ProductsModel)
		.catch(this.handleError);

		//return this.databaseService.getAllProducts()
		//.toPromise()
		//.then(response => response.json() as ProductsModel)
		//.catch(this.handleError);

	}

	getDataFromPouch(): Promise<any> {

		return this.databaseService.getAllProducts()
		.then(response => response)
		.catch(this.handleError);

	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

}
