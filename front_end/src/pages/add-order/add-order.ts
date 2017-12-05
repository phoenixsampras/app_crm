import { Component, NgZone } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, NavParams, LoadingController, ToastController, ModalController, } from 'ionic-angular';
import { CustomersModel } from '../clientes/customers.model';
import { ProductsModel } from '../products/products.model';
import { CustomersService } from '../clientes/customers.service';
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
		public productsService: ProductsService,

	) {
		this.loading = this.loadingCtrl.create();
		this.orderObj = this.navParams.get('order');
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
        let modal = this.modalCtrl.create(SelectProductsPage, { 'selectedProducts': this.selectedProducts });
		modal.onDidDismiss(data => {
			if(data && data.product){
                var flag = false;
				for(var i=0;i<this.selectedProducts.length;i++) {
					let p = this.selectedProducts[i];
					let _p = data;
					if(p.product.id == _p.product.id) {
						this.selectedProducts[i].quantity = parseInt(this.selectedProducts[i].quantity,10) + parseInt(_p.quantity,10);
						flag = true;
					}
				}
				if(!flag)
					this.selectedProducts.push(data);
            }
		});
		modal.present();
	}

	getProductTotal(product) {
		let price = product.product.cg;
		if(this.customerObj.tipo == 'CH') {
			price = product.product.ch;
		} else if(this.customerObj.tipo == 'CM') {
			price = product.product.cm;
		}
		
		return product.quantity * price;
	}
	
	getTotal() {
		let total = 0.0;
		for(var i=0; i < this.selectedProducts.length;i++) {
			total += this.getProductTotal(this.selectedProducts[i]) ;//this.selectedProducts[i].product.price * this.selectedProducts[i].quantity;
		}
		return total;
	}

	chooseItem(item: any) {
		this.customerObj = item;
		this.searchTerm = '';
		this.validations_form.get('customer').setValue(this.customerObj.rm_nombre);
		this.customers = [];
		this.selectedProducts = [];
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
			this.customers = sortedArray;
		});
	}

	ionViewDidLoad() {

	}

	ionViewWillLoad() {

		this.validations_form = this.formBuilder.group({
			customer: new FormControl('', Validators.required),
			dateOrder: new FormControl(new Date().toISOString(), Validators.required),
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
			let toast = this.toastCtrl.create({
				message: "Agregue al menos un producto",
				duration: 3000,
				cssClass: 'toast-error',
				position:'bottom',
			});
			toast.present();
			// alert('Add atleast one product to the order');
			return;
		} else {

			values.customerObj = this.customerObj;
			values.selectedProducts = this.selectedProducts;
			values.total = this.getTotal();
			values.latitude = this.ordersService.lat;
			values.longitude = this.ordersService.lng;
			console.log(values);
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
				message: "Pedido guardado correctamente!",
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
