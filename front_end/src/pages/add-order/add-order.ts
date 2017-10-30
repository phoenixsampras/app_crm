import { Component, NgZone } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, NavParams, LoadingController, ToastController, ModalController, } from 'ionic-angular';

import { DatabaseService } from '../sync/database.service';
import { CustomersModel } from './customers.model';
import { ProductsModel } from './products.model';
import { CustomersService } from './customers.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from './products.service';
import { ProductsPage } from '../products/products';
@Component({
  selector: 'add-order-page',
  templateUrl: 'add-order.html'
})

export class AddOrderPage {

	validations_form: FormGroup;
	customersList: CustomersModel = new CustomersModel();
	productsList: ProductsModel = new ProductsModel();
	products:any = [];
	loading: any;
	selectedProducts:any = [];

	constructor(
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public customersService: CustomersService,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public ordersService: OrdersService,
		public productsService: ProductsService,
		public modalCtrl: ModalController

	) {
		this.loading = this.loadingCtrl.create();
	}

	removeProduct(id) {
		for(var i=0; i<this.selectedProducts.length;i++) {
			if(this.selectedProducts[i].product.id == id) {
				this.selectedProducts.splice(i, 1);
				break;
			}
		}
	}

	addProducts() {
		// reset
        let modal = this.modalCtrl.create(ProductsPage, { 'products': this.products });
		modal.onDidDismiss(data => {
			if(data){
                //this.skills.push(data.name);
				//this.getPlaceDetail(data.place_id);
				console.log(data);
				this.selectedProducts.push(data);
            }
		});
		modal.present();
	}

	getTotal() {
		let total = 0.0;
		for(var i=0; i<this.selectedProducts.length;i++) {
			total += this.selectedProducts[i].product.price * this.selectedProducts[i].quantity;
		}
		return total;
	}

	ionViewDidLoad() {

		this.loading.present();
		if(window.navigator.onLine){
			this.customersService
			.getDataFromServer()
			.then(data => {
				console.log(data);
				this.customersList.items = data.rmListaClientes;
				for(var i = 0; i< this.customersList.items.length;i++)
				{
					//console.log(this.customersList.items[i].id);
					this.customersService.addCustomer(this.customersList.items[i]);
				}

			});
			this.productsService
			.getDataFromServer()
			.then(data => {
				this.productsList.items = data.rmListaProductos;
				for(var i = 0; i< this.productsList.items.length;i++)
				{
					this.products[this.productsList.items[i].id] = this.productsList.items[i];
					this.productsService.addProduct(this.productsList.items[i]);

				}
				this.products.splice(0, 1);
				console.log(this.productsList.items);
				console.log(this.products);
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
					this.customersList.items = sortedArray;

			});
			this.productsService
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
					this.productsList.items = sortedArray;
					for(var i = 0; i< this.productsList.items.length;i++)
					{
						this.products[this.productsList.items[i].id] = this.productsList.items[i];

					}

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
		if(!this.selectedProducts.length) {
			alert('Add atleast one product to the order');
			return;
		} else {
			values.selectedProducts = this.selectedProducts;
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
			this.selectedProducts = [];
		}
		//console.log(this.databaseService.add(values));
		/*if(window.navigator.onLine){
			var url = "http://odoo.romilax.com/organica/back_end/rmXMLRPC.php?task=rmRegistrarPedido&rmCustomer="+values.customer+"&rmDateOrder="+ values.dateOrder +"&rmNote=" + values.notes + "&callback=JSONP_CALLBACK";
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

		}*/

	}
}
