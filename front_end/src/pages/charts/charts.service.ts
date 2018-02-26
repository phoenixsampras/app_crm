import { Injectable } from '@angular/core';
import { ChartsModel } from './charts.model';
import { ChartsModelVentasMes } from './charts.model';
import { ChartsModelVentasEjecutadas } from './charts.model';
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import { OrdersService } from '../orders/orders.service';


@Injectable()
export class ChartsService {

	constructor(
		public jsonp: Jsonp,
		private databaseService: DatabaseService,
		public ordersService: OrdersService,
		
	) {

	}

	getDataFromServer(user_id): Promise<ChartsModel> {
		let url = this.ordersService.getFullUrl('rmXMLRPC_graficos.php?task=rmGraficoVentasDiarioPlan&callback=JSONP_CALLBACK&user_id=' + user_id);
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response.json() as ChartsModel)
		.catch(this.handleError);
	}

	getDataFromServerVentasMes(user_id): Promise<ChartsModelVentasMes> {
		let url = this.ordersService.getFullUrl('rmXMLRPC_graficos.php?task=rmGraficoVentasMesPlan&callback=JSONP_CALLBACK&user_id=' + user_id);
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response.json() as ChartsModelVentasMes)
		.catch(this.handleError);

	}

	getDataFromServerVentasEjecutadas(user_id): Promise<ChartsModelVentasEjecutadas> {
		let url = this.ordersService.getFullUrl('rmXMLRPC_graficos.php?task=rmGraficoVentasEjecutadas&callback=JSONP_CALLBACK&user_id=' + user_id);
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response.json() as ChartsModelVentasEjecutadas)
		.catch(this.handleError);
	}

	private handleError(error: any): Promise<any> {
		console.error('An error occurred', error); // for demo purposes only
		return Promise.reject(error.message || error);
	}

}
