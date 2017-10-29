import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import 'rxjs/Rx';

import { ClientesModel } from './clientes.model';
import { ClientesService } from './clientes.service';
import { CustomersService } from '../add-order/customers.service';

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
    public customersService: CustomersService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad");
    this.loading.present();
    if (window.navigator.onLine) {
      this.ClientesService
        .getData()
        .then(data => {
          this.listaClientes = data.rmListaClientes;
          for (var i = 0; i < this.listaClientes.length; i++) {
            //console.log(this.customersList.items[i].id);
            this.customersService.addCustomer(this.listaClientes[i]);

          }
          this.loading.dismiss();
        });
    } else {
      this.customersService
        .getDataFromPouch()
        .then(data => {

          var sortedArray: any[] = data.sort((obj1, obj2) => {
            if (obj1.name > obj2.name) {
              return 1;
            }

            if (obj1.name < obj2.name) {
              return -1;
            }

            return 0;
          });
          console.log(sortedArray);
          this.listaClientes = sortedArray;

        });
    }
  }

}
