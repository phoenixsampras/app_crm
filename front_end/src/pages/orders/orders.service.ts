import { Injectable } from "@angular/core";
import { Jsonp  } from '@angular/http';
import { DatabaseService } from './database.service';
import 'rxjs/add/operator/toPromise';
import {Platform  } from 'ionic-angular';
import { OrdersModel } from './orders.model';

@Injectable()
export class OrdersService {
	constructor(
		public jsonp: Jsonp,
		private databaseService: DatabaseService,
		private platform: Platform,
		
		
	) {
		this.platform.ready().then(() => {
            //this.databaseService.initDB();      
        });	
	}

	addOrder(order) {
		this.databaseService.addOrder(order);
	}
	
	deleteOrder(order) {
		this.databaseService.deleteOrder(order);
	}
	
	saveOrderOnServer(url): Promise<any> {
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response)
		.catch(this.handleError);
		
		//return this.databaseService.getAllCustomers()
		//.toPromise()
		//.then(response => response.json() as CustomersModel)
		//.catch(this.handleError);
		
	}
	
	saveOrderLineOnServer(url): Promise<any> {
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response)
		.catch(this.handleError);
		
		//return this.databaseService.getAllCustomers()
		//.toPromise()
		//.then(response => response.json() as CustomersModel)
		//.catch(this.handleError);
		
	}
	
	getDataFromServer(): Promise<any> {
		return this.jsonp.request('http://odoo.romilax.com/organica/back_end/rmXMLRPC.php?task=rmListaPedidos&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json())
		.catch(this.handleError);
		
		//return this.databaseService.getAllCustomers()
		//.toPromise()
		//.then(response => response.json() as CustomersModel)
		//.catch(this.handleError);
		
	}
	
	getData(): Promise<any> {
		//return this.http.get('./assets/example_data/lists.json')
		//.toPromise()
		//.then(response => response.json() as OrdersModel)
		//.catch(this.handleError);
		
		return this.databaseService.getAllOrders()
		//.toPromise()
		.then(response => response)
		.catch(this.handleError);
		
	}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}

