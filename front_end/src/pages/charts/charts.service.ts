import { Injectable } from '@angular/core';
import { ChartsModel } from './charts.model';
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
@Injectable()
export class ChartsService {
 
	constructor(
		public jsonp: Jsonp,
		private databaseService: DatabaseService,
		
	) {
    
	}

	getDataFromServer(): Promise<ChartsModel> {
		return this.jsonp.request('http://odoo.romilax.com/organica/back_end/rmXMLRPC_graficos.php?task=rmGraficoVentasPlan&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
		.then(response => response.json() as ChartsModel)
		.catch(this.handleError);

	}
	
	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}
	
}
