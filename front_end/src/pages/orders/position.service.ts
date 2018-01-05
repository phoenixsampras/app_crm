import { Injectable } from "@angular/core";
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';
import 'rxjs/add/operator/toPromise';



@Injectable()
export class PositionService {
	constructor(
		public jsonp: Jsonp,
		private databaseService: DatabaseService,

	) {

	}

	addPosition(position) {
		
		var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmRegistrarGeolocalizacionLive&longitude=" + position.lng + "&latitude=" + position.lat + "&res_user_id=" + position.user_id + "&rm_bearing=" + position.bearing +"&callback=JSONP_CALLBACK";
		if (window.navigator.onLine) {
			this.savePositionOnServer(url);
			let me = this;
			this.getData()
			.then(data => {
			  // console.log("DATA"+JSON.stringify(data));
				let flags = [];
				for (var i = 0; i < data.length; i++) {
					var position = data[i];
					var url = "http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmRegistrarGeolocalizacionLive&longitude=" + position.lng + "&latitude=" + position.lat + "&res_user_id=" + position.user_id + "&rm_bearing=" + position.bearing +"&callback=JSONP_CALLBACK";
					me.savePositionOnServer(url);
					position.sync = 2;
					me.databaseService.updatePosition(position);
				}
			});
		} else {
			this.databaseService.addPosition(position);
		
		}
		
	}
	
	updatePosition(position) {
		this.databaseService.updatePosition(position);
	}

	deletePosition(position) {
		this.databaseService.deletePosition(position);
	}

	savePositionOnServer(url): Promise<any> {
		return this.jsonp.request(url,{method:'Get'})
		.toPromise()
		.then(response => response)
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

		return this.databaseService.getAllPositions()
		//.toPromise()
		.then(response => response)
		.catch(this.handleError);

	}

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
