import { Injectable } from '@angular/core';
import { ChartsModel } from './charts.model';
import { ChartsModelVentasMes } from './charts.model';
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
@Injectable()
export class ChartsService {

	constructor(
		public jsonp: Jsonp,
		private databaseService: DatabaseService,

	) {

	}

	getDataFromServer(user_id): Promise<ChartsModel> {
		return this.jsonp.request('http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_graficos.php?task=rmGraficoVentasDiarioPlan&callback=JSONP_CALLBACK&user_id=' + user_id,{method:'Get'})
		.toPromise()
		.then(response => response.json() as ChartsModel)
		.catch(this.handleError);
	}

  getDataFromServerVentasMes(user_id): Promise<ChartsModelVentasMes> {
		return this.jsonp.request('http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_graficos.php?task=rmGraficoVentasMesPlan&callback=JSONP_CALLBACK&user_id=' + user_id,{method:'Get'})
		.toPromise()
		.then(response => response.json() as ChartsModelVentasMes)
		.catch(this.handleError);

	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

}
