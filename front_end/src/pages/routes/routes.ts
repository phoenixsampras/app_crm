import { Component, ViewChild, OnInit } from '@angular/core';
import { ViewController, NavController, LoadingController, ToastController, NavParams } from 'ionic-angular';
import { Geolocation} from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { Observable } from 'rxjs/Observable';
import { GoogleMap } from "../../components/google-map/google-map";
import { RoutesService } from "./routes.service";
import { MapsModel, MapPlace } from './maps.model';
import { OrdersService } from '../orders/orders.service';

@Component({
  selector: 'routes-page',
  templateUrl: 'routes.html'
})

export class RoutesPage implements OnInit {
	@ViewChild(GoogleMap) _GoogleMap: GoogleMap;
	map_model: MapsModel = new MapsModel();
	toast: any;
	marker:any;
	lat:any;
	lng:any;
	markerDrag:any = false;
	constructor(
		public nav: NavController,
		public navParams: NavParams,
		public loadingCtrl: LoadingController,
		public toastCtrl: ToastController,
		public viewCtrl: ViewController,
		public routesService: RoutesService,
		public geolocation: Geolocation,
		public ordersService: OrdersService,
		public keyboard: Keyboard
	) {
		
		//this.lat = this.navParams.get('lat');
		//this.lng = this.navParams.get('lng');
		//if((!this.lat || this.lat == 0) && (!this.lng  || this.lng == 0)) {
		//	this.lat = this.ordersService.lat;
		//	this.lng = this.ordersService.lng;
		//}
		//let current_location = new google.maps.LatLng(this.lat, this.lng);
		//this.map_model.map_options.center = current_location;
		
	}

	ngOnInit() {
		let _loading = this.loadingCtrl.create();
		_loading.present();

		this._GoogleMap.$mapReady.subscribe(map => {
			var infowindow = new google.maps.InfoWindow();
			var flightPlanCoordinates = [];
			var bounds = new google.maps.LatLngBounds();
			let locations = this.routesService.getDataFromServer() 
			.then(data => {
				console.log(data);
				let locations = data.rmRutaDiaria;
				for (var i = 0; i < locations.length; i++) {
					let marker = new google.maps.Marker({
						position: new google.maps.LatLng(locations[i].rm_latitude, locations[i].rm_longitude),
						map: map
					});
					flightPlanCoordinates.push(marker.getPosition());
					bounds.extend(marker.getPosition());

					google.maps.event.addListener(marker, 'click', (function (marker, i) {
						return function () {
							infowindow.setContent(locations[i]['name']);
							infowindow.open(map, marker);
						}
					})(marker, i));
				}
				map.fitBounds(bounds);
				 var start = flightPlanCoordinates[0];
				var end = flightPlanCoordinates[flightPlanCoordinates.length - 1];
				var waypts = [];
				for (var i = 1; i < flightPlanCoordinates.length - 1; i++) {
					waypts.push({
						location: flightPlanCoordinates[i],
						stopover: true
					});
				}
				this.routesService.getDirections(start, end, waypts)
				.subscribe(response => {
					this.map_model.init(map);
					this.map_model.directions_display.setDirections(response);
					
				});
				
			});
			//let current_location = new google.maps.LatLng(this.lat, this.lng);
			//this.marker = new google.maps.Marker({position: current_location, map:this.map_model.map,draggable:this.markerDrag,});
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
