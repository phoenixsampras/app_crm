import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, App, ToastController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Observable } from 'rxjs/Observable';

import { TabsNavigationPage } from '../pages/tabs-navigation/tabs-navigation';
import { FormsPage } from '../pages/forms/forms';
import { LayoutsPage } from '../pages/layouts/layouts';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';
import { SettingsPage } from '../pages/settings/settings';
import { FunctionalitiesPage } from '../pages/functionalities/functionalities';
import { OrdersPage } from '../pages/orders/orders';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CalendarPage } from '../pages/calendar/calendar';
import { SyncPage } from '../pages/sync/sync';
import { ClientesPage } from '../pages/clientes/clientes';
import { ChartsPage } from '../pages/charts/charts';
import { ProductsPage } from '../pages/products/products';
import { LoginPage } from '../pages/login/login';
import { RoutesPage } from '../pages/routes/routes';
import { DatabaseService } from '../pages/sync/database.service';
import { OrdersService } from '../pages/orders/orders.service';
import { LocationTracker } from '../providers/location-tracker/location-tracker';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  // make WalkthroughPage the root (or first) page
  rootPage: any = WalkthroughPage;
  // rootPage: any = OrdersPage;
  // rootPage: any = LoginPage;
  // rootPage: any = ProductsPage;
  // rootPage: any = ProductsPage;

  textDir: string = "ltr";

  pages: Array<{ title: any, icon: string, component: any }>;
  pushPages: Array<{ title: any, icon: string, component: any }>;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public app: App,
    public splashScreen: SplashScreen,
    public statusBar: StatusBar,
    public translate: TranslateService,
    public toastCtrl: ToastController,
    public ordersService: OrdersService,
    public databaseService: DatabaseService,
	public locationTracker: LocationTracker

  ) {
    translate.setDefaultLang('es');
    // translate.setDefaultLang('en');
    translate.use('es');
    // translate.use('en');

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.splashScreen.hide();
      this.statusBar.styleDefault();
      this.databaseService.getLoginData()
        .then(data => {
          console.log("App Component " + data);
          me.ordersService.loginId = data.loginId;
          me.ordersService.rmDatosUsuario = data.rmDatosUsuario;
          me.ordersService.rmCompany = data.rmCompany;
          me.nav.setRoot(OrdersPage);
		  me.locationTracker.startTracking();
        }).catch(function(err) {
          console.log("not logged in");
        });
		me.platform.registerBackButtonAction(() => {
			if (me.nav.canGoBack())
				me.nav.pop().then(() => {}, () => {}); // If called very fast in a row, pop will reject because no pages
		}, 500);
		
    });
    let me = this;

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (event.lang == 'ar') {
        platform.setDir('rtl', true);
        platform.setDir('ltr', false);
      }
      else {
        platform.setDir('ltr', true);
        platform.setDir('rtl', false);
      }
      Observable.forkJoin(
        this.translate.get('HOME'),
        // this.translate.get('FORMS'),
        // this.translate.get('FUNCTIONALITIES'),
        this.translate.get('ORDERS'),
        this.translate.get('CUSTOMERS'),
        this.translate.get('PRODUCTS'),
        this.translate.get('CALENDAR'),
        this.translate.get('ROUTES'),
        this.translate.get('CHARTS'),
        this.translate.get('SYNC'),
        // this.translate.get('LAYOUTS'),
        this.translate.get('SETTINGS')
      ).subscribe(data => {
        this.pages = [
          { title: data[0], icon: 'home', component: TabsNavigationPage },
          // { title: data[1], icon: 'create', component: FormsPage },
          // { title: data[2], icon: 'code', component: FunctionalitiesPage },
          { title: data[1], icon: 'clipboard', component: OrdersPage },
          { title: data[2], icon: 'contacts', component: ClientesPage },
          { title: data[3], icon: 'filing', component: ProductsPage },
          { title: data[4], icon: 'calendar', component: CalendarPage },
          { title: data[5], icon: 'navigate', component: RoutesPage },
          { title: data[6], icon: 'pulse', component: ChartsPage },
          { title: data[7], icon: 'sync', component: SyncPage }

        ];

        this.pushPages = [
          // { title: data[6], icon: 'grid', component: LayoutsPage },
          { title: data[8], icon: 'settings', component: SettingsPage }
        ];
      });
    });

  }

  logout() {
    this.menu.close();
    let me = this;
    this.databaseService.deleteLoginData()
      .then(data => {
        me.nav.setRoot(LoginPage);
      })
      .catch(function(err) {
        me.nav.setRoot(LoginPage);
      });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  pushPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // rootNav is now deprecated (since beta 11) (https://forum.ionicframework.com/t/cant-access-rootnav-after-upgrade-to-beta-11/59889)
    this.app.getRootNav().push(page.component);
  }
}
