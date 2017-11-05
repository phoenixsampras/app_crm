import { Component } from '@angular/core';
import { ViewController, NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ProductsService } from './products.service';
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


	products:any = [];
	searchTerm:any = "";
	searching: any = false;
	searchControl: FormControl;
	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public formBuilder: FormBuilder,
		public productsService: ProductsService
	) {
		
		this.searchControl = new FormControl();
	}
	
	updateSearch() {
		this.productsService
		.getDataFromPouch(this.searchTerm)
		.then(data => {
			this.products = data;
		});
	}
	
	filterItems(event){
		let searchTerm = this.searchTerm;
		this.searching = true;
    }
	
	onSearchInput(){
        this.searching = true;
    }
 
    setFilteredItems() {   
		this.productsService
        .getDataFromPouch(this.searchTerm)
        .then(data => {
			console.log(data);
			this.products = data;
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
}
