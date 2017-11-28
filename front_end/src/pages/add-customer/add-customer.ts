import { Component, NgZone } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';

import { CustomersService } from '../clientes/customers.service';

@Component({
  selector: 'add-customer-page',
  templateUrl: 'add-customer.html'
})

export class AddCustomerPage {

	validations_form: FormGroup;
	loading: any;
	customer:any;
	
	
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public formBuilder: FormBuilder,
		public customersService: CustomersService,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,

	) {
		this.loading = this.loadingCtrl.create();
		this.customer = this.navParams.get('customer');
	}

	
	ionViewDidEnter() {
		if(this.customer) {
			this.validations_form.get('rm_nombre').setValue(this.customer.rm_nombre);
			this.validations_form.get('rm_direccion').setValue(this.customer.rm_direccion);
			this.validations_form.get('rm_telefono').setValue(this.customer.rm_telefono);
			this.validations_form.get('rm_celular').setValue(this.customer.rm_celular);
		}
	}

	ionViewWillLoad() {

		this.validations_form = this.formBuilder.group({
			rm_nombre: new FormControl('', Validators.required),
			rm_direccion: new FormControl('', Validators.required),
			rm_telefono: new FormControl('', Validators.required),
			rm_celular: new FormControl('', []),
		});
	}

	validation_messages = {
		'rm_nombre': [
			{ type: 'required', message: 'Se requiere el nombre.' }
		],
		'rm_direccion': [
			{ type: 'required', message: 'Se requiere el dirección.' }
		],
		'rm_telefono': [
			{ type: 'required', message: 'Se requiere un teléfono.' }
		],
	};

    onSubmit(values){
		console.log(values);
		if(this.customer) {
			values.id = this.customer.id;
			values._rev = this.customer._rev;
			this.customersService.updateCustomer(values);
		} else {
			values.id = Date.now();
			this.customersService.addCustomer(values);
		}
		
		let toast = this.toastCtrl.create({
			message: "Cliente ahorrado con éxito!",
			duration: 3000,
			cssClass: 'toast-success',
			position:'bottom',
		});
		toast.present();
		this.navCtrl.pop();
	}
}
