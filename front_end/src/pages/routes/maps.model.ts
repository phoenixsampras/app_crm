export class MapsModel {
	map: google.maps.Map;
	map_options: google.maps.MapOptions = {
		center: {lat: 40.785091, lng: -73.968285},
		zoom: 13,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		scrollwheel: false
	};

	
	// https://developers.google.com/maps/documentation/javascript/reference#Map
	init(map: google.maps.Map) {
		this.map = map;
		// https://developers.google.com/maps/documentation/javascript/reference#DirectionsRenderer
		/*this.directions_display = new google.maps.DirectionsRenderer({
			map: this.map,
			suppressMarkers: true,
			preserveViewport: true
		});*/
	}

	
}
