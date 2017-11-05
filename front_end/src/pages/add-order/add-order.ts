import { Component, NgZone } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, NavParams, LoadingController, ToastController, ModalController, } from 'ionic-angular';

import { CustomersModel } from './customers.model';
import { ProductsModel } from '../products/products.model';
import { CustomersService } from './customers.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';

import { SelectProductsPage } from '../select-products/select-products';
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
	customerObj:any;
	customers:any = [];
	searchTerm:any = "";
	orderObj : any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public formBuilder: FormBuilder,
		public customersService: CustomersService,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public ordersService: OrdersService,
		public modalCtrl: ModalController,
		public productsService: ProductsService

	) {
		this.loading = this.loadingCtrl.create();
		this.orderObj = this.navParams.get('order');
		console.log(this.orderObj);
	}

	removeProduct(id) {
		for(var i=0; i<this.selectedProducts.length;i++) {
			if(this.selectedProducts[i].product.id == id) {
				this.selectedProducts.splice(i, 1);
				break;
			}
		}
	}

	ionViewDidEnter() {
		if(this.orderObj) {
			this.validations_form.get('customer').setValue(this.orderObj.customerObj.rm_nombre);
			this.validations_form.get('dateOrder').setValue(this.orderObj.dateOrder);
			this.validations_form.get('notes').setValue(this.orderObj.notes);
			this.selectedProducts = this.orderObj.selectedProducts;
			this.customerObj = this.orderObj.customerObj;
		}
	}
	
	addProducts() {
		// reset
        let modal = this.modalCtrl.create(SelectProductsPage, { 'products': this.products });
		modal.onDidDismiss(data => {
			if(data){
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

	chooseItem(item: any) {
		this.customerObj = item;
		this.searchTerm = '';
		this.validations_form.get('customer').setValue(this.customerObj.rm_nombre);
		this.customers = [];
	}
	
	updateSearch() {
		this.customersService
		.getDataFromPouch(this.searchTerm)
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
			this.customers = sortedArray;
		});
	}
	
	ionViewDidLoad() {

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
			
			values.customerObj = this.customerObj;
			values.selectedProducts = this.selectedProducts;
			values.total = this.getTotal();
			if(this.orderObj) {
				values._id = this.orderObj._id;
				values.id = this.orderObj.id;
				values._rev = this.orderObj._rev;
				this.ordersService.updateOrder(values);
			} else {
				this.ordersService.addOrder(values);
				for(var i=0; i<this.selectedProducts.length;i++) {
					let st = this.selectedProducts[i].quantity * -1;
					this.productsService.stockProduct(this.selectedProducts[i].product.id,st ); 	
				}
			}
			
			let toast = this.toastCtrl.create({
				message: "Order saved on device successfully!",
				duration: 3000,
				cssClass: 'toast-success',
				position:'bottom',
			});
			toast.present();
			this.navCtrl.pop();
			this.validations_form.get('dateOrder').setValue('');
			this.validations_form.get('customer').setValue('');
			this.validations_form.get('notes').setValue('');
			this.selectedProducts = [];
		}
		

	}
}
