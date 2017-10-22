import { Component, NgZone } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, Platform, LoadingController,ToastController } from 'ionic-angular';
import { DatabaseService } from '../orders/database.service';
import { CustomersModel } from './customers.model';
import { CustomersService } from './customers.service';
import { OrdersService } from '../orders/orders.service';

@Component({
  selector: 'add-order-page',
  templateUrl: 'add-order.html'
})

export class AddOrderPage {

	validations_form: FormGroup;
	customersList: CustomersModel = new CustomersModel();
	loading: any;


	constructor(
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public customersService: CustomersService,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public ordersService: OrdersService,


	) {
		this.loading = this.loadingCtrl.create();
	}

	ionViewDidLoad() {

		this.loading.present();
		if(window.navigator.onLine){
			var data = this.customersService
			.getDataFromServer()
			.then(data => {
				this.customersList.items = data.listaClientes;
				for(var i = 0; i< this.customersList.items.length;i++)
				{
					//console.log(this.customersList.items[i].id);
					this.customersService.addCustomer(this.customersList.items[i]);
				}
				this.loading.dismiss();
			});

		} else {
			var data = this.customersService
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
					this.customersList.items = sortedArray;

				this.loading.dismiss();
			});
		}

	}

	ionViewWillLoad() {

		this.validations_form = this.formBuilder.group({
			customer: new FormControl('', Validators.required),
			dateOrder: new FormControl('', Validators.required),
			notes: new FormControl('', []),
		});
	}

  validation_messages = {

    'customer': [
		{ type: 'required', message: 'Customer is required.' }
    ],
	'dateOrder': [
		{ type: 'required', message: 'Order Date is required.' }
    ],

  };

    onSubmit(values){
		console.log(values);
		//console.log(this.databaseService.add(values));
		if(window.navigator.onLine){
			var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC_pedidos.php?task=rmRegistrarPedido&rmCustomer="+values.customer+"&rmDateOrder="+ values.dateOrder +"&rmNote=" + values.notes + "&callback=JSONP_CALLBACK";
			url = encodeURI(url);
			this.ordersService.saveOrderOnServer(url).then(data=>{
				let toast = this.toastCtrl.create({
					message: "Order saved on server successfully!",
					duration: 3000,
					cssClass: 'toast-success',
					position:'bottom',
				});
				toast.present();
				this.validations_form.get('dateOrder').setValue('');
				this.validations_form.get('customer').setValue('');
				this.validations_form.get('notes').setValue('');
			});;
		} else {
			this.ordersService.addOrder(values);
			let toast = this.toastCtrl.create({
				message: "Order saved on device successfully!",
				duration: 3000,
				cssClass: 'toast-success',
				position:'bottom',
			});
			toast.present();
			this.validations_form.get('dateOrder').setValue('');
			this.validations_form.get('customer').setValue('');
			this.validations_form.get('notes').setValue('');

		}
	}
}
