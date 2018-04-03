import { Component } from '@angular/core';
import { ViewController, NavController, NavParams, ToastController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ProductsService } from '../products/products.service';
/**
 * Generated class for the SkillAutocompletePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'select-products-page',
  templateUrl: 'select-products.html',
})
export class SelectProductsPage {


	product:any;
	products:any = [];
	selectedProducts:any = [];
	validations_form: FormGroup;
	searchTerm:any = "";
	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public toastCtrl: ToastController,
		public formBuilder: FormBuilder,
		public productsService: ProductsService
	) {

		this.product = {
			product: '',
      quantity: '',
			stock: ''
		};
		this.selectedProducts = this.navParams.get('selectedProducts');
		this.validations_form = this.formBuilder.group({
			product: new FormControl('', Validators.required),
      quantity: new FormControl('', Validators.required),
			stock: new FormControl('', Validators.required),
		});
	}

	updateSearch() {
		this.productsService
		.getDataFromPouch(this.searchTerm)
		.then(data => {
			this.products = data;
			for(var i=0;i<this.selectedProducts.length;i++) {
				let p = this.selectedProducts[i];
				for(var j=0;j<this.products.length;j++) {
					let _p = this.products[j];
					if(p.product.id == _p.id) {
						var new_stock = parseInt(this.products[j].stock,10) - parseInt(p.quantity,10);
						this.products[j].stock = new_stock;

					}
				}
			}
		});
	}

	validation_messages = {
		'product': [
			{ type: 'required', message: 'Producto es requerido.' }
		],
		'quantity': [
			{ type: 'required', message: 'Cantidad es requerida.' }
		],

	};

	dismiss() {
		this.viewCtrl.dismiss(this.product);
	}

	cancel(){
		this.viewCtrl.dismiss();
	}

	chooseItem(item: any) {
		this.product.product = item;
		this.searchTerm = '';
		let value = this.product.product.product;
    this.validations_form.get('product').setValue(value);
		this.validations_form.get('stock').setValue(this.product.product.stock);
    console.log(value);
		this.products = [];
	}

	addProduct(values) {
		this.product.quantity = values.quantity;
		if(this.product.quantity <= this.product.product.stock) {
			let data = {'product' : this.product,'reopen' : 1};
			this.viewCtrl.dismiss(data);
		} else {
			let toast = this.toastCtrl.create({
				message: "El producto no cuenta con suficiente stock: " + this.product.product.stock,
				duration: 3000,
				cssClass: 'toast-error',
				position:'bottom',
			});
			toast.present();
		}
	}

	onSubmit(values) {
		this.product.quantity = values.quantity;
		if(this.product.quantity <= this.product.product.stock) {
			let data = {'product' : this.product,'reopen' : 2};
			this.viewCtrl.dismiss(data);
		} else {
			let toast = this.toastCtrl.create({
				message: "El pedido no cuenta con suficiente stock, revise su pedido!",
				duration: 3000,
				cssClass: 'toast-error',
				position:'bottom',
			});
			toast.present();
		}
	}
}
