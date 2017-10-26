import { Injectable } from "@angular/core";
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import 'rxjs/add/operator/toPromise';
import { CalendarModel } from './calendar.model';

@Injectable()
export class CalendarService {
	constructor(
		public jsonp: Jsonp,
		private databaseService: DatabaseService,

	) {

	}

	addCalendarEvent(event) {
		this.databaseService.addEvent(event);
	}

	getDataFromServer(): Promise<CalendarModel> {
		return this.jsonp.request('http://odoo.romilax.com/organica/back_end/rmXMLRPC_calendario.php?task=rmListaEventos&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json() as CalendarModel)
		.catch(this.handleError);
	}

	getDataFromPouch(): Promise<any> {

		return this.databaseService.getAllEvents()
		.then(response => response)
		.catch(this.handleError);

	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

}
