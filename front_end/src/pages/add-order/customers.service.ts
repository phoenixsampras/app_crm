import { Injectable } from "@angular/core";
import { Http, Jsonp  } from '@angular/http';
import { DatabaseService } from '../orders/database.service';
import 'rxjs/add/operator/toPromise';
import {Platform  } from 'ionic-angular';
import { CustomersModel } from './customers.model';

@Injectable()
export class CustomersService {
	constructor(
		public http: Http,
		public jsonp: Jsonp,
		private databaseService: DatabaseService,
		private platform: Platform,


	) {

	}

	addCustomer(customer) {
		 this.databaseService.addCustomer(customer);
	}

	getDataFromServer(): Promise<CustomersModel> {
		return this.jsonp.request('http://odoo.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmListaClientes&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json() as CustomersModel)
		.catch(this.handleError);

		//return this.databaseService.getAllCustomers()
		//.toPromise()
		//.then(response => response.json() as CustomersModel)
		//.catch(this.handleError);

	}

	getDataFromPouch(): Promise<any> {

		return this.databaseService.getAllCustomers()
		.then(response => response)
		.catch(this.handleError);

	}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
