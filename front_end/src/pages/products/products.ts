import { Component } from '@angular/core';
import { ViewController, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ProductsService } from './products.service';
import { OrdersService } from '../orders/orders.service';
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
		public loadingCtrl: LoadingController,
		public formBuilder: FormBuilder,
		public productsService: ProductsService,
		public ordersService: OrdersService,
    
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
	
	syncProductPTData() {
		console.log(this.loadingCtrl);
	  let loadingCtrl = this.loadingCtrl;
      let loading = loadingCtrl.create();
      loading.present();
	  let me = this;
      this.ordersService
        .getData()
        .then(data => {
			var products = [];
			var quantity = [];
			for (var i = 0; i < data.length; i++) {
				var order = data[i];
                // Solo sincronizar pedidos no sincronizados anteriormente y con numeracion
				if (order.sync && order.numberOrder > 0) {
					//console.log(order);
					for(var j=0; j< order.selectedProducts.length; j++) {
						var product = order.selectedProducts[j];
						//console.log(product);
						if(products[product.product.id]){
							let q = parseInt(products[product.product.id], 10);
							let _q = parseInt(product.quantity, 10);
							products[product.product.id] = q + _q;
						} else {						
							products[product.product.id] = parseInt(product.quantity, 10);
						}
						//quantity.push(product.quantity);
					}
					
					
				}
			}
			console.log(products);
			for(var k=0; k<products.length;k++) {
				if(products[k]) {
					console.log(products[k]);
					me.productsService.updateProductPT(k, products[k]);
				}
					
			}
			//console.log(quantity);
			loading.dismiss();
		});  
	}
}
