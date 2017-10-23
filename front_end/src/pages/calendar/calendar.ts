import { Component } from '@angular/core';
import { NavController, SegmentButton, LoadingController } from 'ionic-angular';
import 'rxjs/Rx';

import { CalendarModel } from './calendar.model';
import { CalendarService } from './calendar.service';
import moment from 'moment';

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
	
	constructor(
		public nav: NavController,
		public calendarService: CalendarService,
		public loadingCtrl: LoadingController
	) {
		this.loading = this.loadingCtrl.create();
	}

	ionViewDidEnter() {
		
		this.loading.present();
		if(window.navigator.onLine){
			var data = this.calendarService
			.getDataFromServer()
			.then(data => {
				this.calendarList.items = data.rmListaEventos;
				console.log(this.calendarList.items);
				for(var i = 0; i< this.calendarList.items.length;i++)
				{
					this.calendarList.items[i].title = this.calendarList.items[i].name;
					this.calendarList.items[i].startTime = moment(this.calendarList.items[i].start_datetime, "YYYY-MM-DD HH:mm;ss").toDate();
					this.calendarList.items[i].endTime = moment(this.calendarList.items[i].start_datetime, "YYYY-MM-DD HH:mm;ss").toDate();;
				}
				this.loadEvents();
				this.loading.dismiss();
			});
			
		} else {
			var data = this.calendarService
				.getDataFromPouch()
				.then(data => {
				
					var sortedArray: any[] = data.sort((obj1, obj2) => {
						if (obj1.name > obj2.name) {
							return 1;
						}

						if (obj1.name < obj2.name) {
							return -1;
						}

						return 0;
					});
					console.log(sortedArray);
					this.calendarList.items = sortedArray;
				
				this.loading.dismiss();
			});
		}
		
	}

}
