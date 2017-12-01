import { Injectable } from "@angular/core";
import { Http, Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import 'rxjs/add/operator/toPromise';
import {Platform  } from 'ionic-angular';
import { CustomersModel } from './customers.model';

@Injectable()
export class CustomersService {
	
	EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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

	updateCustomer(customer) {
		this.databaseService.updateCustomer(customer);
	}

	deleteCustomer(customer) {
		this.databaseService.deleteCustomer(customer);
	}

	getDataFromServer(): Promise<CustomersModel> {
		return this.jsonp.request('http://odoo2.romilax.com/organica/back_end/rmXMLRPC_clientes.php?task=rmListaClientes&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json() as CustomersModel)
		.catch(this.handleError);

		//return this.databaseService.getAllCustomers()
		//.toPromise()
		//.then(response => response.json() as CustomersModel)
		//.catch(this.handleError);

	}

	getDataFromPouch(searchTerm = ''): Promise<any> {

		return this.databaseService.getAllCustomers(searchTerm)
		.then(response => response)
		.catch(this.handleError);

	}
	
	saveCustomerOnServer(url): Promise<any> {
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response)
		.catch(this.handleError);
	}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
