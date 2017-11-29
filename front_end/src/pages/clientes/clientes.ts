import { Component } from '@angular/core';
import { NavController, LoadingController,AlertController  } from 'ionic-angular';

import 'rxjs/Rx';

import { CustomersService } from './customers.service';
import 'rxjs/add/operator/debounceTime';
import { FormControl } from '@angular/forms';
import { AddCustomerPage } from '../add-customer/add-customer';
import { CustomersModel } from '../clientes/customers.model';
import { LoginPage } from '../login/login';

@Component({
  selector: 'clientes',
  templateUrl: 'clientes.html'
})
export class ClientesPage {
	clientes: CustomersModel = new CustomersModel();
	loading: any;
	listaClientes: any = [];
	searchTerm:any = "";
	searching: any = false;
	searchControl: FormControl;
	customer:any = "";
	constructor(
		public nav: NavController,
		public customersService: CustomersService,
		public loadingCtrl: LoadingController,
		public alertCtrl: AlertController
	) {
		this.loading = this.loadingCtrl.create();
		this.searchControl = new FormControl();
	}

	filterItems(event){
		let searchTerm = this.searchTerm;
		this.searching = true;
    }
	
	onSearchInput(){
        this.searching = true;
    }
	
	call(number) {
		window.location.href = 'tel:' + number;	
	}
	
	email(email) {
		window.location.href = 'mailto:' + email;	
	}
 
    setFilteredItems() {   
		this.customersService
        .getDataFromPouch(this.searchTerm)
        .then(data => {
			this.listaClientes = data;
			this.searching = false;
		});
    }
	
	ionViewDidEnter() {
		this.setFilteredItems();
    }
	
	ionViewDidLoad() {
		this.searchControl.valueChanges.debounceTime(700).subscribe(search => {        
            this.setFilteredItems();
        });
    }

	agregarCliente() {
		this.nav.push(AddCustomerPage, {'customer' : this.customer});
	}
	
	editCustomer(item) {
		this.nav.push(AddCustomerPage, {'customer' : item});
	}
	
	deleteCustomer(customer) {
		let confirm1 = this.alertCtrl.create({
			title: 'Confirmar eliminación?',
			message: '¿Seguro que quieres este cliente?',
			buttons: [
				{
					text: 'Cancelar',
					handler: () => {
						console.log('Disagree clicked');
					}
				},
				{
					text: 'Ok',
					handler: () => {
						this.customersService.deleteCustomer(customer);
						alert('Cliente eliminado con éxito');
						this.setFilteredItems();
					}
				}
			]
		});
		confirm1.present();	
	}
	
	ionViewWillLoad() {
		if(!this.ordersService.loginId) {
			this.nav.setRoot(LoginPage);
		}
	}

}
