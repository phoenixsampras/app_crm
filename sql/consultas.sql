-- Crosstab para obtener listas de precios

CREATE EXTENSION tablefunc;

CREATE or REPLACE VIEW rm_product_stock_pricelist AS
SELECT rmapplistaproductosnulos.id,
    rmapplistaproductosnulos.code,
    rmapplistaproductosnulos.producto,
    COALESCE(rmapplistaproductosnulos.ch,0) AS ch,
    COALESCE(rmapplistaproductosnulos.cm, 0) AS cm,
    COALESCE(rmapplistaproductosnulos.cg, 0) AS cg
FROM (

SELECT crosstab.id,
    crosstab.code,
    crosstab.producto,

    crosstab.ch,
    crosstab.cm,
    crosstab.cg
    --crosstab.mh,
    --crosstab.md
   FROM crosstab('
		SELECT id, code, producto,  tarifa, price_unit
		FROM (
			SELECT
			pt.name as producto
			,ppi.pricelist_id as tarifa
			,COALESCE(ppi.fixed_price::numeric, 0) as price_unit
			,pp.id as id
			,pp.id as code
			FROM product_template pt
			LEFT JOIN product_pricelist_item ppi ON ppi.product_tmpl_id=pt.id
			LEFT JOIN product_product pp ON pp.product_tmpl_id=pt.id
		) tarifas
		ORDER BY producto
	'::text, '
		SELECT id FROM product_pricelist ORDER BY id
	'::text) crosstab(id integer, code text, producto text, ch double precision, cm double precision, cg double precision)
	) AS rmapplistaproductosnulos;

-- Stock de productos transferidos al Vendedor

SELECT
pp.id,
pp.default_code as code,
pp.name_template as product,
slu.user_id,
sm.product_en_transito as transito,
sum(sm.product_qty) as stock,
sum(psp.ch) as ch,
sum(psp.cm) as cm,
sum(psp.cg) as cg
FROM
stock_move AS sm
LEFT JOIN product_product AS pp ON sm.product_id = pp.id
LEFT JOIN stock_location_users AS slu ON slu.location_id = sm.location_dest_id
LEFT JOIN rm_product_stock_pricelist as psp ON psp.id = slu.user_id

--WHERE slu.user_id = 7 AND sm.product_en_transito is True
GROUP BY 1,2,3,4,5
ORDER BY product_en_transito
