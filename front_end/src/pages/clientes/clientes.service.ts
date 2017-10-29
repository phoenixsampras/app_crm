import { Injectable } from "@angular/core";
import { Http, Jsonp  } from '@angular/http';
import { SyncService } from '../sync/sync.service';
import PouchDB from 'pouchdb';

import 'rxjs/add/operator/toPromise';

import { ClientesModel } from './clientes.model';

@Injectable()
export class ClientesService {
  private _clientes;

  constructor(
    public jsonp: Jsonp,
    public http: Http,
    public syncService: SyncService
  ) {}

  // Obtener datos de PouchDB
  getDataFromPouch(): Promise<any> {
		return this.getAllCustomersFromPouchDB()
		.then(response => response)
		.catch(this.handleError);
	}

  // NO USAR Obtener datos directamente del servidor para el la pagina clientes
  getData(): Promise<ClientesModel> {
    console.log("getData");
    return this.jsonp.request('http://odoo.romilax.com/organica/back_end/rmXMLRPC_clientes.php?task=rmListaClientes&callback=JSONP_CALLBACK',{method:'Get'})
     .toPromise()
     .then(
       response => response.json() as ClientesModel

     )
     .catch(this.handleError);
  }

  // Obtener clientes de PouchDB
  getAllCustomersFromPouchDB() {
    if (!this.syncService._db)
      this.syncService.initDB();
    return new Promise(resolve => {
      this.syncService._db.allDocs({
        include_docs: true,
        startkey: 'cliente',
        endkey: 'cliente\ufff0'
      })
        .then(docs => {

          // console.log('docs1 ->' + JSON.stringify(docs.rows));

          // Each row has a .doc object and we just want to send an
          // array of customer objects back to the calling controller,
          // so let's map the array to contain just the .doc objects.

          this._clientes = docs.rows.map(row => {
            // Dates are not automatically converted from a string.
            if (row.doc.type == "cliente")
              // console.log('docs2 ->' + JSON.stringify(row.doc));
              return row.doc;
          });

          // Listen for changes on the database.
          resolve(this._clientes);
        });

    });
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
