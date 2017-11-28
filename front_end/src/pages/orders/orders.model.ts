export class OrdersModel {
	customer: string;
	orderDate: string;
	note:string;
	confirmed:boolean = false;
	items: Array<OrdersModel>;
	latitude:string;
	longitude:string;
}
