export class CustomersModel {
	id: string;
	_id: string;
	name: string; //name
	street:string; //street
	phone: string; //phone
	mobile:string; //mobile
	items: Array<CustomersModel>;
	rmListaClientes : Array<CustomersModel>;
	rm_longitude:string; //rm_longitude
	rm_latitude:string; //rm_latitude
	photo_s:string;
	photo_m:string; //image
	razon_social:string; // razon_social
	nit:string; // nit
	email:string; //email
	user_id:any; // user_id
	property_product_pricelist:string; //property_product_pricelist
	rm_sync_date_time:any;
	rm_sync_operacion:string;
	newCustomer = 0;
	rm_dias_semana = [];
}
