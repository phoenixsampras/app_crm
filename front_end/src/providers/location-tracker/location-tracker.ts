import { ToastController } from 'ionic-angular';
import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { PositionService } from '../../pages/orders/position.service';
import 'rxjs/add/operator/filter';
import { OrdersService } from '../../pages/orders/orders.service';

@Injectable()
export class LocationTracker {

  public watch: any;
  public lat;
  public lng;
  public bearing;
  public frequency = 5;

  constructor(
    public zone: NgZone,
    public backgroundGeolocation: BackgroundGeolocation,
    public toastCtrl: ToastController,
    public geolocation: Geolocation,
    public positionService: PositionService,
    public ordersService: OrdersService,
  ) {

  }

  startTracking() {
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: false,
      interval: 2000
    };
    let toastCtrl = this.toastCtrl;

    this.backgroundGeolocation.configure(config).subscribe((location) => {
      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = location.latitude;
        this.lng = location.longitude;
        // let currentTime = time();
        let currentTime = Date.now();
        // console.log("Date.now():" + Date.now());
        let diff = (currentTime - this.ordersService.timestamp) / 1000;
        console.log('BackgroundGeolocation:' + JSON.stringify(location) + " Diff:" + diff);
        // console.log("diff:" + diff);
        if (this.lat != this.ordersService.lat && this.lng != this.ordersService.lng && diff > this.frequency) {
          this.ordersService.lat = this.lat;
          this.ordersService.lng = this.lng;
          this.ordersService.timestamp = currentTime;
          var pos = { 'lat': this.lat, 'lng': this.lng, 'user_id': this.ordersService.loginId, 'bearing': location.bearing, 'sync': 1 };
          var posLog = 'lat:' + this.lat + ' lng:' + this.lng + ' user_id:' + this.ordersService.loginId + ' bearing' + location.bearing + ' diff:' + diff;
          this.positionService.addPosition(pos);
          let toast = toastCtrl.create({
            message: "BackgroundGeolocation:" + posLog,
            duration: 3000,
            cssClass: 'toast-success',
            position: 'bottom',
          });
          // toast.present();
        }
      });

    }, (err) => {
      console.log(err);
    });

    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();


    // Foreground Tracking

    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };

    this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        let currentTime = Date.now();
        let diff = (currentTime - this.ordersService.timestamp) / 1000;
        console.log("Foreground:" + JSON.stringify(position) + " Diff:" + diff);
        // console.log("diff:" + diff);
        if (this.lat != this.ordersService.lat && this.lng != this.ordersService.lng && diff > this.frequency) {
          this.ordersService.lat = this.lat;
          this.ordersService.lng = this.lng;
          this.ordersService.timestamp = currentTime;
          var pos = { 'lat': this.lat, 'lng': this.lng, 'user_id': this.ordersService.loginId, 'bearing': position.coords.heading, 'sync': 1  };
          var posLog = 'lat:' + this.lat + ' lng:' + this.lng + ' user_id:' + this.ordersService.loginId + ' bearing' + position.coords.heading + ' diff:' + diff;
          this.positionService.addPosition(pos);
          let toast = toastCtrl.create({
            message: "ForegroundGeolocation:" + posLog,
            duration: 3000,
            cssClass: 'toast-error',
            position: 'bottom',
          });
          // toast.present();
        }
      });

    });
  }

  stopTracking() {
    console.log('stopTracking');
    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
  }

}
