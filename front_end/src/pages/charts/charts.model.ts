export class ChartsModel {
	date_order: string;
	quantity: string;
	plan: string;
	items: Array<ChartsModel>;
	rmGraficoVentasDiarioPlan : Array<ChartsModel>;
}

export class ChartsModelVentasMes {
	rm_proyeccion_ventas_mensual: string;
	sales_total: string;
	items: Array<ChartsModelVentasMes>;
	rmGraficoVentasMesPlan : Array<ChartsModelVentasMes>;
}
