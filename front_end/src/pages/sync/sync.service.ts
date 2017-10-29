import { Injectable } from '@angular/core';
import { Http, Jsonp  } from '@angular/http';
import PouchDB from 'pouchdb';
import { Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ClientesModel } from '../clientes/clientes.model';

@Injectable()
export class SyncService {
  public _db;
  private _clientes;

  constructor(
    public http: Http,
    public jsonp: Jsonp,
    private platform: Platform,
    public alertCtrl: AlertController
  ) {
    this.platform.ready().then(() => {
      this.initDB();
    });
  }

  initDB() {
    this._db = new PouchDB('romilax.db');
    // this._db = new PouchDB('orders.db', { adapter: 'idb' });
  }

  // obtainCustomersFromServer2PouchDB(): Promise<ClientesModel> {
  // }

  // getDataFromServer(): Promise<CustomersModel> {
  getDataFromServer(): Promise<ClientesModel> {
		return this.jsonp.request('http://odoo.romilax.com/organica/back_end/rmXMLRPC_clientes.php?task=rmListaClientes&callback=JSONP_CALLBACK',{method:'Get'})
		.toPromise()
    .then(response => response.json() as ClientesModel)
		// .then(response.json())
		.catch(this.handleError);
	}

  getDataFromPouch(): Promise<any> {

		return this.getAllCustomers()
		.then(response => response)
		.catch(this.handleError);

	}

  addCustomer(cliente) {
    let id = "cliente-" + cliente.id;
    let db = this._db;
    cliente._id = "cliente-" + cliente.id;
    cliente.type = "cliente";
    this._db.get(id).then(function(doc) {
      return doc;
    }).catch(function(err) {
      console.log(err);
      return db.put(cliente);
    });

  }

  private handleError(error: any): Promise<any> {
    console.error('ERROR CARAJITO:', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  getAllCustomers() {
    if (!this._db)
      this.initDB();
    return new Promise(resolve => {
      this._db.allDocs({
        include_docs: true,
        startkey: 'customer',
        endkey: 'customer\ufff0'
      })
        .then(docs => {

          // Each row has a .doc object and we just want to send an
          // array of customer objects back to the calling controller,
          // so let's map the array to contain just the .doc objects.

          this._clientes = docs.rows.map(row => {
            // Dates are not automatically converted from a string.
            if (row.doc.type == "customer")
              return row.doc;
          });

          // Listen for changes on the database.
          resolve(this._clientes);
        });

    });
  }

}
