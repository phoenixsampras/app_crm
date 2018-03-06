import * as numeral from 'numeral';
import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from '../orders/orders.service';

import { FeedPage } from '../feed/feed';
import 'rxjs/Rx';

import { ListingModel } from './listing.model';
import { ListingService } from './listing.service';
// import { ChartsPage } from '../charts/charts';
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
  indicador1 = [];
  indicador2 = [];
  indicador3 = [];
  options = {
		responsive: true,
		maintainAspectRatio: false,
  };
  datitos: any;

  constructor(
    public nav: NavController,
    public ordersService: OrdersService,
    public listingService: ListingService,
    public chartsService: ChartsService,
    // public charts: ChartsPage,
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

  condition () {
    return false;
  }
	ionViewDidEnter() {

		if (window.navigator.onLine) {
      this.chartsService
			.getDataFromServer(this.ordersService.loginId)
			.then(data => {
        console.log(data.rmGraficoVentasDiarioPlan[data.rmGraficoVentasDiarioPlan.length-1]);
        this.indicador1.push(data.rmGraficoVentasDiarioPlan[data.rmGraficoVentasDiarioPlan.length-1].plan);
        this.indicador1.push(data.rmGraficoVentasDiarioPlan[data.rmGraficoVentasDiarioPlan.length-1].quantity);
        console.log(this.indicador1);
        // debugger;
      });

      this.chartsService
      .getDataFromServerVentasEjecutadas(this.ordersService.loginId)
      .then(data => {
        // console.log(data.rmGraficoVentasEjecutadas[0].pedidos);
        this.indicador2.push(data.rmGraficoVentasEjecutadas[0].pedidos);
        this.indicador2.push(data.rmGraficoVentasEjecutadas[1].clientes);
        // this.indicador2.push(numeral(data.rmGraficoVentasEjecutadas[0]).format('0,0.00'));
        // this.indicador2.push(numeral(data.rmGraficoVentasEjecutadas[1]).format('0,0.00'));
        console.log(this.indicador2);
        // debugger;
      });

      this.chartsService
			.getDataFromServerVentasMes(this.ordersService.loginId)
			.then(data => {
        console.log(data.rmGraficoVentasMesPlan[0].rm_proyeccion_ventas_mensual);

        this.indicador3.push(data.rmGraficoVentasMesPlan[0].sales_total);
        this.indicador3.push(data.rmGraficoVentasMesPlan[0].rm_proyeccion_ventas_mensual);
      });

    }
  }
				// console.log(this.data);

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    this.nav.push(FeedPage, { category: category });
  }

}
