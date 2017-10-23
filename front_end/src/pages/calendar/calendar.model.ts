

export class CalendarModel {
	name: string;
	description: string;
	start_datetime: string;
	end_datetime: string;
	title: string;
	startTime: any;
	endTime: any;
	allDay: boolean = false;
	
	items: Array<CalendarModel>;
	rmListaEventos : Array<CalendarModel>;
}

