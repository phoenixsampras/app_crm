import { Component } from '@angular/core';
import { NavController, LoadingController , ModalController} from 'ionic-angular';
import { OrdersService } from './orders.service';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/Rx';
import { AddOrderPage } from '../add-order/add-order';
import { PrintOrderPage } from '../print-order/print-order';
import { ToastController } from 'ionic-angular';
import { PositionService } from './position.service';
import { LoginPage } from '../login/login';

@Component({
  selector: 'orders-page',
  templateUrl: 'orders.html'
})
export class OrdersPage {
  messages: any = [];
	loading: any;
	ordersList: any = [];
	shapesArray = [];
	constructor(
    public toastCtrl: ToastController,
		public nav: NavController,
		public loadingCtrl: LoadingController,
		public ordersService: OrdersService,
		public positionService: PositionService,
		public modalCtrl: ModalController,

	) {

	}

	getTotal() {
		let total = 0;
		for(var i=0; i< this.ordersList.length;i++) {
			total += this.ordersList[i].total;
		}
		return total;
	}

	getOrderNumber(order) {
		return order.numberOrder ? order.numberOrder + "" : "-";
	}

	editOrder(item) {
		if(item.confirmed) {
			alert('Confirmed order cannot be changed');
		} else {
			this.nav.push(AddOrderPage, {'order' : item});
		}
	}

	printOrder(item) {
		let modal = this.modalCtrl.create(PrintOrderPage, { 'order': item });
		modal.onDidDismiss(data => {
			this.ordersService
			.getData()
			.then(data1 => {
				this.ordersList = data1;
				this.ordersList.sort(function(a, b){
					return  a.numberOrder - (b.numberOrder ? b.numberOrder : 0 );
				});
			});
		});
		modal.present();
	}

	goToAddOrder() {
    let toastCtrl = this.toastCtrl;
    let toast = toastCtrl.create({
      message: "Bloquear ventas fuera de Geocerca: " + this.ordersService.rm_geofence_sales,
      duration: 3000,
      cssClass: 'toast-success',
      position: 'bottom',
    });
    toast.present();

    console.log("Bloquear ventas fuera de Geocerca:" + this.ordersService.rm_geofence_sales);
		if(this.ordersService.rm_geofence_sales) {

			let lat = this.ordersService.lat;
			let lng = this.ordersService.lng;
			var point = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));

      // Verificar si el cliente esta dentro o fuera de la geocerca y bloquear venta si el vendedor tiene restriccion de geocerca
			let flag = false;
			for(var i=0; i < this.shapesArray.length; i++) {
				let shape = this.shapesArray[i];
				flag = google.maps.geometry.poly.containsLocation(point, shape);
				if(flag)
					break;
			}
			if(flag) {
				this.nav.push(AddOrderPage, {'order' : ''});
			} else {
        let toastCtrl = this.toastCtrl;
        let toast = toastCtrl.create({
          message: "Ventas bloqueadas fuera de Geocerca, consulte al Administrador.",
          duration: 3000,
          cssClass: 'toast-error',
          position: 'bottom',
        });
        toast.present();
			}

		} else {
			this.nav.push(AddOrderPage, {'order' : ''});
		}
	}

	ionViewDidEnter() {
		this.ordersService
		.getData()
		.then(data => {
			this.ordersList = data;
			this.ordersList.sort(function(a, b){
				return  a.numberOrder - (b.numberOrder ? b.numberOrder : 0 );
			});
		});
		let geofencesArray = this.ordersService.geofencesArray;
		for(var i =0; i<geofencesArray.length; i++) {
			let geofence = geofencesArray[i];
			var _locations = geofence.locations;
			var locations = [];
			for (var j = 0; j < _locations.length; j++) {
				var point = new google.maps.LatLng(parseFloat(_locations[j].rm_latitude), parseFloat(_locations[j].rm_longitude));
				locations.push(point);

			}
			var bermudaTriangle = new google.maps.Polygon({
				paths: locations,
				strokeColor: '#000000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#000000',
				fillOpacity: 0.25,
				editable: false
			});
			this.shapesArray.push(bermudaTriangle);
		}

	}

	ionViewWillLoad() {

		if(!this.ordersService.loginId) {
			this.nav.setRoot(LoginPage);
		}
	}


}
