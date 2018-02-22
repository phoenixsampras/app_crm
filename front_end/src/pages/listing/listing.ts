import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';

import { FeedPage } from '../feed/feed';
import 'rxjs/Rx';

import { ListingModel } from './listing.model';
import { ListingService } from './listing.service';
import { ChartsService } from '../charts/charts.service';


@Component({
  selector: 'listing-page',
  templateUrl: 'listing.html',
})
export class ListingPage {
  listing: ListingModel = new ListingModel();
  loading: any;
	type: any = 'line';
	  data = {labels:[], datasets:[]};
	  options = {
		responsive: true,
		maintainAspectRatio: false,

	  };
  constructor(
    public nav: NavController,
    public ordersService: OrdersService,
    public listingService: ListingService,
    public chartsService: ChartsService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
  }


  ionViewDidLoad() {
    this.loading.present();
    this.listingService
      .getData()
      .then(data => {
        this.listing.banner_image = data.banner_image;
        this.listing.banner_title = data.banner_title;
        this.listing.populars = data.populars;
        this.listing.categories = data.categories;
        this.loading.dismiss();
      });
  }
	ionViewDidEnter() {

		if (window.navigator.onLine) {
			this.chartsService
			.getDataFromServer(this.ordersService.loginId)
			.then(data => {
				console.log(data);
				let items = data.rmGraficoVentasDiarioPlan;
				var yaxis1 = [];
				var yaxis2 = [];
				let labels = [];
				for(var i=0; i< items.length; i++) {
					/*let y1 = {'x' : items[i].date_order, 'y' : items[i].quantity};
					let y2 = {'x' : items[i].date_order, 'y' : items[i].plan};
					yaxis1.push(y1);
					yaxis2.push(y2);*/
					labels.push(items[i].date_order);
					yaxis1.push(items[i].quantity);
					yaxis2.push(items[i].plan);
				}
				let y1 = {'label' : 'Quantity', data: yaxis1,fill: false, borderColor: 'rgb(255, 99, 132)',backgroundColor: 'rgb(255, 99, 132)',};
				let y2 = {'label' : 'Plan', data: yaxis2,fill: false,  borderColor: 'rgb(54, 162, 235)',backgroundColor: 'rgb(54, 162, 235)',};
				this.data.datasets.push(y1);
				this.data.datasets.push(y2);
				this.data.labels = labels;
				console.log(this.data);

			});
		}
	}

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    this.nav.push(FeedPage, { category: category });
  }

}
