import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { Platform } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ClientesModel } from './clientes//clientes.model';

@Injectable()
export class DatabaseSyncService {
  private _db;
  private _clientes;

  constructor(
    private platform: Platform,
    public alertCtrl: AlertController
  ) {
    this.platform.ready().then(() => {
      this.initDB();
    });
  }

  initDB() {
    this._db = new PouchDB('orders.db', { adapter: 'idb' });
  }

  
}
