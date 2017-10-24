import { Component } from '@angular/core';
import { ViewController, NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
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
	
	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public formBuilder: FormBuilder
	) {
		
		this.products = this.navParams.get('products');
		console.log(this.products);
		this.product = {
			product: '',
			quantity: ''
		};
		
		this.validations_form = this.formBuilder.group({
			product: new FormControl('', Validators.required),
			quantity: new FormControl('', Validators.required),
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
	
	
	onSubmit(values) {
		this.product.product = this.products[values.product];
		this.product.quantity = values.quantity;
		this.viewCtrl.dismiss(this.product);
	}

}
