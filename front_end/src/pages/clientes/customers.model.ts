export class CustomersModel {
	id: string;
	_id: string;
	rm_nombre: string; //name
	rm_direccion:string; //street
	rm_telefono: string; //phone
	rm_celular:string; //mobile
	items: Array<CustomersModel>;
	rmListaClientes : Array<CustomersModel>;
	rm_longitude:string; //rm_longitude
	rm_latitude:string; //rm_latitude
	photo_s:string;
	photo_m:string; //image
	rm_razon_social:string; // razon_social
	rm_nit:string; // nit
	rm_email:string; //email
	res_user_id:any; // user_id
	tipo:string; //property_product_pricelist
}
