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
		
	}

  


}
