import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import 'rxjs/Rx';
import { CalendarModel } from './calendar.model';
import { CalendarService } from './calendar.service';
import moment from 'moment';
import { AddEventPage } from '../add-event/add-event';
import { LoginPage } from '../login/login';
import { OrdersService } from '../orders/orders.service';

@Component({
  selector: 'calendar-page',
  templateUrl: 'calendar.html'
})
export class CalendarPage {
	segment: string;
	calendarList: CalendarModel = new CalendarModel();
	loading: any;
	eventSource;
    viewTitle;
    isToday: boolean;
    calendar = {
        mode: 'month',
        currentDate: new Date()
    };

	loadEvents() {
        this.eventSource = this.calendarList.items;
    }
	
	onViewTitleChanged(title) {
        this.viewTitle = title;
    }
	
	onEventSelected(event) {
        console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
    }
	
	changeMode(mode) {
        this.calendar.mode = mode;
    }
    today() {
        this.calendar.currentDate = new Date();
    }
    onTimeSelected(ev) {
        console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
            (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
    }
    onCurrentDateChanged(event:Date) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        event.setHours(0, 0, 0, 0);
        this.isToday = today.getTime() === event.getTime();
    }
	
	
	onRangeChanged(ev) {
        console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
    }
    markDisabled = (date:Date) => {
        var current = new Date();
        current.setHours(0, 0, 0);
        return date < current;
    };
	
	goToAddEvent() {
		this.nav.push(AddEventPage, {'event' : ''});
	}
	
	constructor(
		public nav: NavController,
		public calendarService: CalendarService,
		public ordersService: OrdersService,
		public loadingCtrl: LoadingController
	) {
		
	}

	ionViewDidEnter() {
		let loading = this.loadingCtrl.create();
		loading.present();
		this.calendarService
			.getDataFromPouch()
			.then(data => {
				console.log(data);
				this.calendarList.items = data;
				for(var i = 0; i< this.calendarList.items.length;i++)
				{
					this.calendarList.items[i].title = this.calendarList.items[i].name;
					this.calendarList.items[i].startTime = moment(this.calendarList.items[i].start_datetime, "YYYY-MM-DD HH:mm:ss").toDate();
					this.calendarList.items[i].endTime = moment(this.calendarList.items[i].start_datetime, "YYYY-MM-DD HH:mm:ss").toDate();;
					
				}
				this.loadEvents();
				loading.dismiss();
		});
	}
	
	ionViewWillLoad() {
		if(!this.ordersService.loginId) {
			this.nav.setRoot(LoginPage);
		}
	}

}
