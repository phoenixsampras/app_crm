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
			quantity: ''
		};
		
		this.validations_form = this.formBuilder.group({
			product: new FormControl('', Validators.required),
			quantity: new FormControl('', Validators.required),
		});
	}
	
	updateSearch() {
		this.productsService
		.getDataFromPouch(this.searchTerm)
		.then(data => {
			this.products = data;
		});
	}
	
	validation_messages = {
		'product': [
			{ type: 'required', message: 'Product is required.' }
		],
		'quantity': [
			{ type: 'required', message: 'Quantity is required.' }
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
		this.products = [];
	}
	
	onSubmit(values) {
		this.product.quantity = values.quantity;
		if(this.product.quantity <= this.product.product.stock) {
			this.viewCtrl.dismiss(this.product);
		} else {
			let toast = this.toastCtrl.create({
				message: "The quantity for the selected product is not in the stock!",
				duration: 3000,
				cssClass: 'toast-error',
				position:'bottom',
			});
			toast.present();
		}
		
	}

}
