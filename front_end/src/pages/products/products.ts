import { Component } from '@angular/core';
import { ViewController, NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ProductsService } from '../add-order/products.service';
/**
 * Generated class for the SkillAutocompletePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'products-page',
  templateUrl: 'products.html',
})
export class ProductsPage {


	product:any;
	products:any = [];
	validations_form: FormGroup;
	searchTerm:any = "";
	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		public viewCtrl: ViewController,
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
		this.viewCtrl.dismiss(this.product);
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
		this.viewCtrl.dismiss(this.product);
	}

}
