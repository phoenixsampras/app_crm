import { Injectable } from '@angular/core';  
import PouchDB from 'pouchdb';  
import {Platform  } from 'ionic-angular';

@Injectable()
export class DatabaseService {  
    private _db;
    private _customers;
	private _orders;
	private _positions;
	private _events;
	private _products;
	
	constructor(private platform: Platform,) 
    {
		this.platform.ready().then(() => {
            this.initDB();      
        });
    }
	
    initDB() {
       this._db = new PouchDB('websql://orders.db');
    }
	
	deleteDB() {
		let db = this._db;
		db.allDocs().then(function (result) {
		  // Promise isn't supported by all browsers; you may want to use bluebird
		  return Promise.all(result.rows.map(function (row) {
			return db.remove(row.id, row.value.rev);
		  }));
		}).then(function () {
			alert('done');
		}).catch(function (err) {
		  // error!
		});	
	}
	
	addCustomer(customer) {  
		let id = "customer-" + customer.id;
		let db = this._db;
		customer._id = "customer-" + customer.id;
		customer.type = "customer";
		this._db.get(id).then(function (doc) {
		  return doc;
		}).catch(function (err) {
			console.log(err);
			return db.put(customer);
		});
		
	}
	
	addProduct(product) {  
		let id = "product-" + product.id;
		let db = this._db;
		product._id = "product-" + product.id;
		product.type = "product";
		this._db.get(id).then(function (doc) {
		  return doc;
		}).catch(function (err) {
			console.log(err);
			return db.put(product);
		});
		
	}
	
	addOrder(order) {  
		order.type = "order";
		order._id = "order-" + Date.now();
		return this._db.put(order).then(data=>{
			console.log(data);
			
		});;
		
	}
	
	addPosition(position) {  
		position.type = "latlng";
		position._id = "latlng-" + Date.now();
		return this._db.put(position).then(data=>{
			console.log(data);
			
		});;
		
	}
	
	addEvent(event) { 

		if(event.start_datetime) {
			var re = / /gi; 
			var str = event.start_datetime ? event.start_datetime : "";
			var newstr = str.replace(re, "-"); 
			var re = /:/gi; 
			var newstr = newstr.replace(re, "-"); 
			var str = event.name;
			event.type = "cevent";
			var id =  "cevent-" + str.toLowerCase() + "-" + newstr ;
			event._id = "cevent-" + str.toLowerCase() + "-" + newstr ;
			let db = this._db;
			this._db.get(id).then(function (doc) {
			  return doc;
			}).catch(function (err) {
				console.log(err);
				return db.put(event);
			});
		}
		
		
	}
	
	deletePosition(position) {  
		return this._db.remove(position);
	}
	
	deleteOrder(order) {  
		return this._db.remove(order);
	}
	
	update(customer) {  
		return this._db.put(customer);
	}
	
	delete(customer) {  
		return this._db.remove(customer);
	}
	
	getAllOrders() {  
		if(!this._db)
			this.initDB();
		return new Promise(resolve => 
		{
			this._db.allDocs({include_docs: true,
								startkey: 'order',
								endkey: 'order\ufff0'
							})
			.then(docs => {

				// Each row has a .doc object and we just want to send an 
				// array of customer objects back to the calling controller,
				// so let's map the array to contain just the .doc objects.

				this._orders = docs.rows.map(row => {
					// Dates are not automatically converted from a string.
					if(row.doc.type == "order")
						return row.doc;
				});

				
				resolve(this._orders);
			});
			
		});
		
	}
	
	getAllCustomers() {  
		if(!this._db)
				this.initDB();
		return new Promise(resolve => 
		{
			this._db.allDocs({include_docs: true,
								startkey: 'customer',
								endkey: 'customer\ufff0'
							})
			.then(docs => {

				// Each row has a .doc object and we just want to send an 
				// array of customer objects back to the calling controller,
				// so let's map the array to contain just the .doc objects.

				this._customers = docs.rows.map(row => {
					// Dates are not automatically converted from a string.
					if(row.doc.type == "customer")
						return row.doc;
				});

				// Listen for changes on the database.
				resolve(this._customers);
			});
			
		}); 
	}
	
	getAllPositions() {  
		if(!this._db)
				this.initDB();
		return new Promise(resolve => 
		{
			this._db.allDocs({include_docs: true,
								startkey: 'latlng',
								endkey: 'latlng\ufff0'
							})
			.then(docs => {

				// Each row has a .doc object and we just want to send an 
				// array of customer objects back to the calling controller,
				// so let's map the array to contain just the .doc objects.

				this._positions = docs.rows.map(row => {
					// Dates are not automatically converted from a string.
					if(row.doc.type == "latlng")
						return row.doc;
				});

				// Listen for changes on the database.
				resolve(this._positions);
			});
			
		}); 
	}
	
	getAllEvents() {  
		if(!this._db)
				this.initDB();
		return new Promise(resolve => 
		{
			this._db.allDocs({include_docs: true,
								startkey: 'cevent',
								endkey: 'cevent\ufff0'
							})
			.then(docs => {

				// Each row has a .doc object and we just want to send an 
				// array of customer objects back to the calling controller,
				// so let's map the array to contain just the .doc objects.

				this._events = docs.rows.map(row => {
					// Dates are not automatically converted from a string.
					if(row.doc.type == "cevent")
						return row.doc;
				});

				// Listen for changes on the database.
				resolve(this._events);
			});
			
		}); 
	}
	
	getAllProducts() {  
		if(!this._db)
				this.initDB();
		return new Promise(resolve => 
		{
			this._db.allDocs({include_docs: true,
								startkey: 'product',
								endkey: 'product\ufff0'
							})
			.then(docs => {

				// Each row has a .doc object and we just want to send an 
				// array of customer objects back to the calling controller,
				// so let's map the array to contain just the .doc objects.

				this._products = docs.rows.map(row => {
					// Dates are not automatically converted from a string.
					if(row.doc.type == "product")
						return row.doc;
				});

				// Listen for changes on the database.
				resolve(this._products);
			});
			
		}); 
	}
	

}