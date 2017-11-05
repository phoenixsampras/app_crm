export class ProductsModel {
	id: string;
	_id: string;
	price: string;
	code: string;
	product: string;
	stock:any = 0;
	items: Array<ProductsModel>;
	rmListaProductos : Array<ProductsModel>;
}