export class OrdersModel {
	customer: string;
	orderDate: string;
	note:string;
	items: Array<OrdersModel>;
}
