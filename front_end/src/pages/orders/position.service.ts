import { Injectable } from "@angular/core";
import { Jsonp  } from '@angular/http';
import { DatabaseService } from './database.service';
import 'rxjs/add/operator/toPromise';



@Injectable()
export class PositionService {
	constructor(
		public jsonp: Jsonp,
		private databaseService: DatabaseService,
		
	) {
		
	}

	addPosition(position) {
		this.databaseService.addPosition(position);
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

