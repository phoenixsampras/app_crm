import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import { Jsonp  } from '@angular/http';
import { DatabaseService } from '../sync/database.service';

import 'rxjs/add/operator/toPromise';

import { ClientesModel } from './clientes.model';

@Injectable()
export class ClientesService {
  // clientes: any;
  constructor(
    public jsonp: Jsonp,
    private databaseService: DatabaseService,
    public http: Http
  ) {}

  getData(): Promise<ClientesModel> {
    console.log("getData");
    return this.jsonp.request('http://odoo.romilax.com/organica/back_end/rmXMLRPC_clientes.php?task=rmListaClientes&callback=JSONP_CALLBACK',{method:'Get'})
     .toPromise()
     .then(
       response => response.json() as ClientesModel

     )
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
