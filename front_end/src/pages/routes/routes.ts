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
		let me = this;
		this._GoogleMap.$mapReady.subscribe(map => {
			var infowindow = new google.maps.InfoWindow();
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

			 this.customersService.getRoutesDataFromPouch()
			.then(data => {
        // debugger;
        console.log(data);
				let locations = data;
				for (var i = 0; i < locations.length; i++) {
          let marker;
          if (locations[i].total_ventas > 0) {
            let image = './assets/images/icons/marker-green.png';
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(locations[i].rm_latitude, locations[i].rm_longitude),
              map: map,
              icon: image
            });
            this.bounds.extend(marker.getPosition());

          } else {
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(locations[i].rm_latitude, locations[i].rm_longitude),
              map: map
            });
            this.bounds.extend(marker.getPosition());
          }

					google.maps.event.addListener(marker, 'click', (function(marker, i) {
						return function() {
							let content = '<b>' + locations[i].name + '</b><br/>' + locations[i].street + "<br/>";
							content += "<button id='edit-customer-"+ i +"' class='edit-customer button button-md button-default-secondary button-default-md' ion-button data-id='" + locations[i].id + "'>Editar</button>";
							content += "<button id='order-customer-"+ i +"' class='order-customer button button-md button-default-secondary button-default-md' ion-button data-id='" + locations[i].id + "'>Pedido</button>";
							content += "<button id='event-customer-"+ i +"' class='event-customer button button-md button-default-secondary button-default-md' ion-button data-id='" + locations[i].id + "'>Evento</button>";
							infowindow.setContent(content);
							infowindow.open(map, marker);
							google.maps.event.addListenerOnce(infowindow, 'domready', () => {
								let infoWindow = infowindow;
								document.getElementById('edit-customer-'+ i).addEventListener('click', (event) => {
									var targetElement = (<HTMLButtonElement>event.target || event.srcElement);
									var id = targetElement.getAttribute("data-id");
									infoWindow.close();
									me.editCustomer(id);
								});
								document.getElementById('order-customer-'+ i).addEventListener('click', (event) => {
									var targetElement = (<HTMLButtonElement>event.target || event.srcElement);
									var id = targetElement.getAttribute("data-id");
									infoWindow.close();
									me.addOrder(id);
								});
								document.getElementById('event-customer-'+ i).addEventListener('click', (event) => {
									var targetElement = (<HTMLButtonElement>event.target || event.srcElement);
									var id = targetElement.getAttribute("data-id");
									infoWindow.close();
									me.addEvent(id);
								});
							});
						}
					})(marker, i));
				}
				map.fitBounds(this.bounds);
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
    // var color = '#' + Math.round((0x1000000 + 0xffffff * Math.random())).toString(16).slice(1);
		var color = '#03a9f4';

		var bermudaTriangle = new google.maps.Polygon({
			paths: locations,
			strokeColor: color,
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: color,
			fillOpacity: 0.25,
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
