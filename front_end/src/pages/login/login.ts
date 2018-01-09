import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import 'rxjs/add/operator/toPromise';
import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';
import { Jsonp, Http } from '@angular/http';
import { OrdersService } from '../orders/orders.service';
import { DatabaseService } from '../sync/database.service';
import { LocationTracker } from '../../providers/location-tracker/location-tracker';

@Component({
  selector: 'login-page',
  templateUrl: 'login.html'
})
export class LoginPage {
  messages: any = [];
  login: FormGroup;
  main_page: { component: any };
  loading: any;


  constructor(
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public ordersService: OrdersService,
    public databaseService: DatabaseService,
    public jsonp: Jsonp,
	public http: Http,
	public locationTracker: LocationTracker

  ) {
    this.main_page = { component: TabsNavigationPage };

    this.login = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      remember: new FormControl('check', [])
    });
  }
  ionViewDidEnter() {

  }
  doLogin(values) {
    let loadingCtrl = this.loadingCtrl;
    let toastCtrl = this.toastCtrl;
    let loading = loadingCtrl.create();
    loading.present();
    let nav = this.nav;
    let me = this;
    this.databaseService.deleteLoginData();
    let url = 'http://cloud.movilcrm.com/organica/back_end/rmXMLRPC_login.php?task=loginApp';
    url += '&username=' + values.email;
    url += '&password=' + values.password;
    url += '&callback=JSONP_CALLBACK';
    this.jsonp.request(url, { method: 'Get' })
      .toPromise()
      .then(data => {
        loading.dismiss();
        if (data['_body']['login'] == 'False') {
          let toast = toastCtrl.create({
            message: "Incorrecto, intente nuevamente.",
            duration: 3000,
            cssClass: 'toast-error',
            position: 'bottom',
          });
          toast.present();
        } else {
          // if (values.remember === true) {
          me.ordersService.loginId = data['_body']['login'];
          me.ordersService.rmDatosUsuario = data['_body']['rmDatosUsuario'];
          me.ordersService.rmCompany = data['_body']['rmCompany'];
		  me.ordersService.location_id = data['_body']['location_id'];
		  me.ordersService.location_dest_id = data['_body']['location_dest_id'];
		  me.ordersService.company_id = data['_body']['company_id'];
		  me.ordersService.picking_type_id = data['_body']['picking_type_id'];
		  me.ordersService.email = values.email;
		  me.ordersService.password = values.password;
		  
		let loginData = {
			'loginId': me.ordersService.loginId,
			'rmDatosUsuario': me.ordersService.rmDatosUsuario,
			'rmCompany': me.ordersService.rmCompany,
			'location_id' : me.ordersService.location_id,
			'location_dest_id' : me.ordersService.location_dest_id,
			'company_id' : me.ordersService.company_id,
			'picking_type_id' : me.ordersService.picking_type_id,
			'email' : values.email,
			'password' : values.password,
		};
			console.log(JSON.stringify(loginData));
			me.databaseService.addLoginData(loginData);
			me.locationTracker.startTracking();
	  
			let toast = toastCtrl.create({
				message: "Bienvenido!" + JSON.stringify(loginData),
				duration: 3000,
				cssClass: 'toast-success',
				position: 'bottom',
			  });
			toast.present();
			nav.setRoot(me.main_page.component);
		
		  
         
          // }
          
        }
        //console.log(data.login);
      });
    //
  }

}
