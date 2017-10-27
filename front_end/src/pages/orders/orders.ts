import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { OrdersService } from './orders.service';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/Rx';
import { AddOrderPage } from '../add-order/add-order';
import { LocationTracker } from '../../providers/location-tracker/location-tracker';
import { PositionService } from './position.service';

@Component({
  selector: 'orders-page',
  templateUrl: 'orders.html'
})
export class OrdersPage {

	loading: any;
	ordersList: any = [];
	constructor(
		public nav: NavController,
		public loadingCtrl: LoadingController,
		public ordersService: OrdersService,
		public positionService: PositionService,
		public locationTracker: LocationTracker
	) {
		this.locationTracker.startTracking();
	}

	goToAddOrder() {
		this.nav.push(AddOrderPage);
	}

	ionViewDidEnter() {

	}



}
