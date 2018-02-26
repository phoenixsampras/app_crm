import { Injectable } from "@angular/core";
import { Http, Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import 'rxjs/add/operator/toPromise';
import {Platform  } from 'ionic-angular';
import { CustomersModel } from './customers.model';
import { OrdersService } from '../orders/orders.service';
@Injectable()
export class CustomersService {

	EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	constructor(
		public http: Http,
		public jsonp: Jsonp,
		private databaseService: DatabaseService,
		private ordersService: OrdersService,
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
		let url = this.ordersService.getFullUrl('rmXMLRPC_clientes.php?task=rmListaClientes&res_user_id=' + this.ordersService.loginId + '&callback=JSONP_CALLBACK');
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response.json() as CustomersModel)
		.catch(this.handleError);
	}

	getCustomer(id): Promise<any> {
		return this.databaseService.getCustomer(id)
		.then(response => response)
		.catch(this.handleError);
	}
	
	getDataFromPouch(searchTerm = ''): Promise<any> {
		return this.databaseService.getAllCustomers(searchTerm)
		.then(response => response)
		.catch(this.handleError);
	}
	
	getUploadDataFromPouch(searchTerm = ''): Promise<any> {
		return this.databaseService.getUploadCustomers()
		.then(response => response)
		.catch(this.handleError);
	}
	
	getRoutesDataFromPouch(): Promise<any> {
		return this.databaseService.getCustomerRoutes()
		.then(response => response)
		.catch(this.handleError);
	}
	

	saveCustomerOnServer(url, customer, i): Promise<any> {
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => {return [response, customer, i];})
		.catch(this.handleError);
	}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
