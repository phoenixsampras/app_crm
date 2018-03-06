import { Component, ViewChild, OnInit } from '@angular/core';
import { ViewController, NavController, LoadingController, ToastController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Keyboard } from '@ionic-native/keyboard';
import { Observable } from 'rxjs/Observable';
import { GoogleMap } from "../../components/google-map/google-map";
import { RoutesService } from "./routes.service";
import { MapsModel } from './maps.model';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../clientes/customers.service';
import { AddCustomerPage } from '../add-customer/add-customer';
import { AddOrderPage } from '../add-order/add-order';
import { AddEventPage } from '../add-event/add-event';

@Component({
  selector: 'routes-page',
  templateUrl: 'routes.html'
})

export class RoutesPage implements OnInit {
  @ViewChild(GoogleMap) _GoogleMap: GoogleMap;
  map_model: MapsModel = new MapsModel();
  toast: any;
  marker: any;
  lat: any;
  lng: any;
  markerDrag: any = false;
  bounds = new google.maps.LatLngBounds();
  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public routesService: RoutesService,
    public geolocation: Geolocation,
    public ordersService: OrdersService,
    public customersService: CustomersService,
    public keyboard: Keyboard,
  ) {

    //this.lat = this.navParams.get('lat');
    //this.lng = this.navParams.get('lng');
    //if((!this.lat || this.lat == 0) && (!this.lng  || this.lng == 0)) {
    	this.lat = this.ordersService.lat;
    	this.lng = this.ordersService.lng;
    //}
    //let current_location = new google.maps.LatLng(this.lat, this.lng);
    //this.map_model.map_options.center = current_location;

  }
	
	ngOnInit() {
		let _loading = this.loadingCtrl.create();
		_loading.present();

		this._GoogleMap.$mapReady.subscribe(map => {
			this.map_model.init(map);
			this.customersService.getRoutesDataFromServer()
			.then(data => {
				//console.log(data);
				let geofences = data.rmListaGeolocalizacionGeocerca;
				//console.log(geofences);
				for (var i = 0; geofences && i < geofences.length; i++) {
					var geofence = geofences[i].geofence ? geofences[i].geofence : geofences[i];
					this.drawShape(geofence);
				}
				this.map_model.map.fitBounds(this.bounds);
				_loading.dismiss();
			});
			
		});
	}
	
	drawShape(geofence) {
		var _locations = geofence.locations;
		var locations = [];
		for (var j = 0; j < _locations.length; j++) {
			var point = new google.maps.LatLng(parseFloat(_locations[j].rm_latitude), parseFloat(_locations[j].rm_longitude));
			locations.push(point);
			this.bounds.extend(point);
		}
		var color = '#' + Math.round((0x1000000 + 0xffffff * Math.random())).toString(16).slice(1);

		var bermudaTriangle = new google.maps.Polygon({
			paths: locations,
			strokeColor: color,
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: color,
			fillOpacity: 0.35,
			editable: false
		});
      //console.log(map1);
		bermudaTriangle.setMap(this.map_model.map);
		//geofenceObjects.push(bermudaTriangle);
		//if (selectFlag)
			//setSelection(bermudaTriangle);

    }
	
	editCustomer(id) {
		this.customersService.getCustomer(id)
		.then(customer => {
			this.nav.push(AddCustomerPage, { 'customer': customer, 'routesPage' : 1 });
		});
	}
	
	addOrder(id) {
		this.customersService.getCustomer(id)
		.then(customer => {
			this.nav.push(AddOrderPage, { 'customerObj': customer });
		});
	}
	
	addEvent(id) {
		//this.customersService.getCustomer(id)
		//.then(customer => {
			//this.nav.push(AddOrderPage, { 'customerObj': customer });
		//});
		this.nav.push(AddEventPage);
	}
	
	
	

  selectLocation() {
    var data = {
      'lat': this.marker.getPosition().lat(),
      'lng': this.marker.getPosition().lng(),
    }
    this.viewCtrl.dismiss(data);
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
