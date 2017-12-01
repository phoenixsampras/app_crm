import { Component, ViewChild, OnInit } from '@angular/core';
import { ViewController, NavController, LoadingController, ToastController, NavParams } from 'ionic-angular';
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
	marker:any;
	lat:any;
	lng:any;
	markerDrag:any = true;
	constructor(
		public nav: NavController,
		public navParams: NavParams,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public viewCtrl: ViewController,
		public GoogleMapsService: GoogleMapsService,
		public geolocation: Geolocation,
		public ordersService: OrdersService,
		public keyboard: Keyboard
	) {
		
		this.lat = this.navParams.get('lat');
		this.lng = this.navParams.get('lng');
		this.markerDrag = this.navParams.get('markerDrag');
		if((!this.lat || this.lat == 0) && (!this.lng  || this.lng == 0)) {
			this.lat = this.ordersService.lat;
			this.lng = this.ordersService.lng;
		}
		let current_location = new google.maps.LatLng(this.lat, this.lng);
		this.map_model.map_options.center = current_location;
		
	}

	ngOnInit() {
		let _loading = this.loadingCtrl.create();
		_loading.present();

		this._GoogleMap.$mapReady.subscribe(map => {
			this.map_model.init(map);
			let current_location = new google.maps.LatLng(this.lat, this.lng);
			this.marker = new google.maps.Marker({position: current_location, map:this.map_model.map,draggable:this.markerDrag,});
			_loading.dismiss();
		});
	}

	ionViewDidEnter() {
		
	}
  
	selectLocation() {
		var data = {
			'lat' : this.marker.getPosition().lat(),
			'lng' : this.marker.getPosition().lng(),
		}
		this.viewCtrl.dismiss(data);
	}
	
	close() {
		this.viewCtrl.dismiss();
	}
  
}
