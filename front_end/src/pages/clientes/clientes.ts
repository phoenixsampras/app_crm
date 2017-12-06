import { Component } from '@angular/core';
import { NavController, LoadingController,AlertController, ToastController, ModalController   } from 'ionic-angular';

import 'rxjs/Rx';

import { CustomersService } from './customers.service';
import 'rxjs/add/operator/debounceTime';
import { FormControl } from '@angular/forms';
import { AddCustomerPage } from '../add-customer/add-customer';
import { CustomersModel } from '../clientes/customers.model';
import { LoginPage } from '../login/login';
import { OrdersService } from '../orders/orders.service';
import { MapsPage } from '../maps/maps';
import { CallNumber } from '@ionic-native/call-number';
import { AddOrderPage } from '../add-order/add-order';

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
		public ordersService: OrdersService,
		public modalCtrl: ModalController,
		public toastCtrl: ToastController,
		public alertCtrl: AlertController,
		private callNumber: CallNumber
		
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
		//window.location.href = 'tel:' + number;	
		this.callNumber.callNumber(number, true)
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
	
	addOrder(item) {
		this.nav.push(AddOrderPage, {'customerObj' : item});
	}
	
	showMap(item) {
		// reset
		console.log(item);
		if (!window.navigator.onLine) {
			let toast = this.toastCtrl.create({
				message: "El servicio de Internet no esta disponible",
				duration: 3000,
				cssClass: 'toast-error',
				position:'bottom',
			});
			toast.present();
			// alert('Add atleast one product to the order');
			return;
		}
		if((!item.rm_latitude || item.rm_latitude == 0) && (!item.rm_longitude || item.rm_longitude == 0)) {
			let toast = this.toastCtrl.create({
				message: "La ubicación del cliente no está disponible",
				duration: 3000,
				cssClass: 'toast-error',
				position:'bottom',
			});
			toast.present();
			// alert('Add atleast one product to the order');
			return;
		} 
		
		let lat = item.rm_latitude;
		let lng = item.rm_longitude;
		
        let modal = this.modalCtrl.create(MapsPage, {'lat' : lat, 'lng' : lng, 'markerDrag' : false});
		modal.onDidDismiss(data => {
			if(data){
              
            }
		});
		modal.present();
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
