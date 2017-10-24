export class ProductsModel {
	id: string;
	_id: string;
	price: string;
	code: string;
	product: string;
	items: Array<ProductsModel>;
	rmListaProductos : Array<ProductsModel>;
}