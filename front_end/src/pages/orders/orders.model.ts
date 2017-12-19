export class OrdersModel {
	customer: string;
	orderDate: string;
	note:string;
	confirmed:boolean = false;
	items: Array<OrdersModel>;
	latitude:string;
	longitude:string;
	newCustomer = 0;
	sync = 0;
	numberOrder = 0;
}
