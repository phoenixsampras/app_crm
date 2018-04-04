import { Component, NgZone } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NavController, NavParams, LoadingController, ToastController, } from 'ionic-angular';
import { CalendarEstadoModel } from '../calendar/calendar.model';

import { CalendarService } from '../calendar/calendar.service';
import { OrdersService } from '../orders/orders.service';


@Component({
  selector: 'add-event-page',
  templateUrl: 'add-event.html'
})

export class AddEventPage {

  validations_form: FormGroup;
  calendarEstadoModel: CalendarEstadoModel = new CalendarEstadoModel();

  loading: any;
  eventObj: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public ordersService: OrdersService,
    public calendarService: CalendarService

  ) {
    this.eventObj = this.navParams.get('event');
    console.log(this.eventObj);

  }


  ionViewDidEnter() {
    this.loading = this.loadingCtrl.create();

    if (this.eventObj) {
      this.validations_form.get('name').setValue(this.eventObj.name);
      this.validations_form.get('rm_estado').setValue(this.eventObj.rm_estado);
      this.validations_form.get('start_datetime').setValue(this.eventObj.start_datetime);
    }

    this.calendarService
      .getEstadoDataFromPouch()
      .then(data => {
        this.calendarEstadoModel = data;
        console.log(this.calendarEstadoModel);
        // this.searching = false;
      });
  }

  ionViewDidLoad() {

  }

  ionViewWillLoad() {

    this.validations_form = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      rm_estado: new FormControl('', Validators.required),
      start_datetime: new FormControl(new Date().toISOString(), Validators.required),
    });
  }

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ],
    'start_datetime': [
      { type: 'required', message: 'Start Date and Time is required.' }
    ],

  };

  cancel() {
    this.navCtrl.pop();
  }

  onSubmit(values) {
    console.log(values);
    values.user_id = this.ordersService.loginId;
    if (this.eventObj) {
      values._id = this.eventObj._id;
      values.id = this.eventObj.id;
      values._rev = this.eventObj._rev;
      this.calendarService.updateCalendarEvent(values);
    } else {
      this.calendarService.addCalendarEvent(values);
    }

    let toast = this.toastCtrl.create({
      message: "Event saved on device successfully!",
      duration: 3000,
      cssClass: 'toast-success',
      position: 'bottom',
    });
    toast.present();
    this.navCtrl.pop();
  }
}
