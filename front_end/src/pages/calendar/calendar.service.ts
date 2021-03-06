import { Injectable } from "@angular/core";
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import 'rxjs/add/operator/toPromise';
import { CalendarModel } from './calendar.model';
import { CalendarEstadoModel } from './calendar.model';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class CalendarService {
	constructor(
		public jsonp: Jsonp,
		private databaseService: DatabaseService,
		public ordersService: OrdersService,

	) {

	}

	addCalendarEvent(event) {
		event.user_id = this.ordersService.loginId;
		this.databaseService.addEvent(event);
	}
	addCalendarEstadoEvent(estado) {
		this.databaseService.addEstadoEvent(estado);
	}
	updateCalendarEvent(event) {
		event.user_id = this.ordersService.loginId;
		this.databaseService.updateEvent(event);
	}

	getDataFromServer(): Promise<CalendarModel> {
		let url = this.ordersService.getFullUrl('rmXMLRPC_calendario.php?task=rmListaEventos&res_user_id='+ this.ordersService.loginId +'&callback=JSONP_CALLBACK');
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response.json() as CalendarModel)
		.catch(this.handleError);
	}

	getEstadoDataFromServer(): Promise<CalendarEstadoModel> {
		let url = this.ordersService.getFullUrl('rmXMLRPC_calendario.php?task=rmListaEstadoEventos&callback=JSONP_CALLBACK');
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response.json() as CalendarEstadoModel)
		.catch(this.handleError);
	}

	getDataFromPouch(): Promise<any> {

		return this.databaseService.getAllEvents()
		.then(response => response)
		.catch(this.handleError);

	}
	
	getSyncDataFromPouch(): Promise<any> {

		return this.databaseService.getAllSyncEvents()
		.then(response => response)
		.catch(this.handleError);

	}

	getEstadoDataFromPouch(): Promise<any> {

		return this.databaseService.getAllEstadoEvents()
		.then(response => response)
		.catch(this.handleError);

	}

	saveEventOnServer(url): Promise<any> {
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
