

export class CalendarModel {
	name: string;
	description: string;
	start_datetime: string;
	end_datetime: string;
	title: string;
	startTime: any;
	endTime: any;
	allDay: boolean = false;
	user_id:any;
	rm_estado:any;

	items: Array<CalendarModel>;
	rmListaEventos : Array<CalendarModel>;
}

export class CalendarEstadoModel {
	id: string;
	name: string;

	items: Array<CalendarEstadoModel>;
	rmListaEstadoEventos : Array<CalendarEstadoModel>;
}
