import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Geolocation} from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { Observable } from 'rxjs/Observable';
import { GoogleMap } from "../../components/google-map/google-map";
import { GoogleMapsService } from "./maps.service";
import { MapsModel, MapPlace } from './maps.model';
import { OrdersService } from '../orders/orders.service';

@Component({
  selector: 'maps-page',
  templateUrl: 'maps.html'
})

export class MapsPage implements OnInit {
	@ViewChild(GoogleMap) _GoogleMap: GoogleMap;
	map_model: MapsModel = new MapsModel();
	toast: any;

	constructor(
		public nav: NavController,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public GoogleMapsService: GoogleMapsService,
		public geolocation: Geolocation,
		public ordersService: OrdersService,
		public keyboard: Keyboard
	) {
		let lat = this.ordersService.lat;
		let lng = this.ordersService.lng;
		let current_location = new google.maps.LatLng(lat, lng);
		this.map_model.map_options.center = current_location;
		var marker = new google.maps.Marker({position: current_location, map:this.map_model.map});
		//marker.setMap(this.map_model.map);
	}

	ngOnInit() {
		let _loading = this.loadingCtrl.create();
		_loading.present();

		this._GoogleMap.$mapReady.subscribe(map => {
			this.map_model.init(map);
			_loading.dismiss();
		});
	}

	ionViewDidEnter() {
		let lat = this.ordersService.lat;
		let lng = this.ordersService.lng;
		let current_location = new google.maps.LatLng(lat, lng);
		this.map_model.map_options.center = current_location;
		var marker = new google.maps.Marker({position: current_location});
		marker.setMap(this.map_model.map);
	}
  
  
}
