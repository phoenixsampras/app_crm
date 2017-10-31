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

  

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
