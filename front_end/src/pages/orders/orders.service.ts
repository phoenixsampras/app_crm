import { Injectable } from "@angular/core";
import { Jsonp, Http  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import 'rxjs/add/operator/toPromise';
import {Platform  } from 'ionic-angular';
import { OrdersModel } from './orders.model';

@Injectable()
export class OrdersService {
	public macAddress;
	public loginId;
	public rmDatosUsuario;
	public rmCompany;
	public email;
	public password;
	public location_id;
	public location_dest_id;
	public company_id;
	public picking_type_id;
	public lat;
	public lng;
	public timestamp = 0;
	public confirmedOrders;
	public base_url = "http://cloud.movilcrm.com/organica/back_end/";
	//public base_url = "http://localhost/back_end/";
	
	getFullUrl(url) {
		return this.base_url + url;
	}
	
	constructor(
		public jsonp: Jsonp,
		public http: Http,
		private databaseService: DatabaseService,
		private platform: Platform,


	) {
		this.getConfirmedOrdersCount();
	}

	resetConfirmedOrdersCount() {
		this.confirmedOrders = 0;	
	}
	
	getConfirmedOrdersCount() {
		let me = this;
		this.databaseService.getConfirmedOrdersCount()
		.then(count =>{
			
			me.confirmedOrders = count;
			console.log(me.confirmedOrders);
		});
	}
	
	addOrder(order) {
		order.rmUserId = this.loginId;
		this.databaseService.addOrder(order);
	}

	updateOrder(order) {
		this.databaseService.updateOrder(order);
	}

	deleteOrder(order) {
		this.databaseService.deleteOrder(order);
	}

	saveOrderOnServer(url, data): Promise<any> {
		return this.http.post(url,data)
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
		.then(response => response.json())
		.catch(this.handleError);

		//return this.databaseService.getAllCustomers()
		//.toPromise()
		//.then(response => response.json() as CustomersModel)
		//.catch(this.handleError);

	}

	getDataFromServer(): Promise<any> {
		return this.jsonp.request('http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmListaPedidos&callback=JSONP_CALLBACK',{method:'Get'})
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
	
	getSyncOrderData(): Promise<any> {
		return this.databaseService.getAllSyncOrders()
		.then(response => response)
		.catch(this.handleError);

	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

}
