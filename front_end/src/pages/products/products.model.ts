export class ProductsModel {
	id: string;
	_id: string;
	price: string;
	code: string;
	product: string;
	stock:any = 0;
	quantity:any = 0;
	originalStock = 0;
	cg:string;
	ch:string;
	cm:string;
	items: Array<ProductsModel>;
	rmListaProductos : Array<ProductsModel>;
	rmStockProductos : Array<ProductsModel>;
}