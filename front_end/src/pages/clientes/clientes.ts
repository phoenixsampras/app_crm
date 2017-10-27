import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import 'rxjs/Rx';

import { ClientesModel } from './clientes.model';
import { ClientesService } from './clientes.service';

@Component({
  selector: 'clientes',
  templateUrl: 'clientes.html'
})
export class ClientesPage {
  clientes: ClientesModel = new ClientesModel();
  loading: any;
  listaClientes: any = [];

  constructor(
    public nav: NavController,
    public ClientesService: ClientesService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad");
    this.loading.present();
    this.ClientesService
      .getData()
      .then(data => {
        this.clientes.rmListaClientes = data.rmListaClientes;
        // this.clientes.items = data.rmListaClientes;
        this.loading.dismiss();
        // console.log(data);
      });
  }

}
