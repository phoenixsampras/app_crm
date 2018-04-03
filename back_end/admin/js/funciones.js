var map;
var users = [];
var selectedUser;
var list = [];
var colors = [];
var map1;
var geofencesArray = [];
var geofenceObjects = [];
var drawingManager;
var pathsArray = [];
var newFlag = false;
var bounds = new google.maps.LatLngBounds();
var mapaVendedorDaterange1;
var mapaVendedorDaterange2;
$.ajaxSetup({
  cache: false
});
$(document).on('ready', function() {
  $('#btnFiltroFechasGeolocalizacion').on('click', function() {
    mapaVendedorDaterange1 = $('#mapaVendedorDaterange1').val();
    mapaVendedorDaterange2 = $('#mapaVendedorDaterange2').val();
    console.log(mapaVendedorDaterange1);
    console.log(mapaVendedorDaterange2);
    initialize();
  });

  $('#btnFiltroFechasGeolocalizacionBorrar').on('click', function() {
    // location.reload(true);
    mapaVendedorDaterange1 = '';
    mapaVendedorDaterange2 = '';
    $('#mapaVendedorDaterange1').val('');
    $('#mapaVendedorDaterange2').val('');
    initialize();
  });

  $('#userDropdown').on('change', function() {
    selectedUser = $(this).val();
    initialize();
  });
  $('#salesDropdown').on('change', function() {
    if (!$('#geofenceDropdown').val() && !newFlag)
      initializeDrawingMap();
  });
  $('#geofenceNewBtn').on('click', function() {
    $('#salesDropdown').val('').trigger('change.select2');
    $('#geofenceDropdown').val('');
    newFlag = true;
  });
  $('#geofenceGoMyPosition').on('click', function() {
    MyPosition();
    newFlag = true;
  });


  $('#geofenceBtn').on('click', function() {
    var users = $('#salesDropdown').val();


    if (!newFlag) {
      var data = {
        "geofence": geofencesArray[$('#geofenceDropdown').val()],
        "users_id": users
      };
      console.log(data);
      sendGeofenceData(data);
    } else {
      if ($('#salesDropdown').val() && pathsArray) {
        var name = prompt("Please enter name for geofence", "");
        if (name) {
          var data = {
            'name': name,
            "users_id": users,
            "pathsArray": pathsArray
          };
          console.log(data);
          sendGeofenceData(data);
          newFlag = false;
          pathsArray = [];

        }
      }
    }
  });
  $('#geofenceDeleteBtn').on('click', function() {
    if ($('#geofenceDropdown').val()) {
      var r = confirm("Are you sure you want to delete the selected geofence?");
      if (r == true)
        deleteGeofenceData($('#geofenceDropdown').val());
    }
  });
  $('#geofenceDropdown').on('change', function() {
    var value = $(this).val();
    if (value) {
      newFlag = false;
      var geo = geofencesArray[value];
      for (var i = 0; i < geofenceObjects.length; i++) {
        geofenceObjects[i].setMap(null);
      }
      drawShape(geo, true);
      var _users = [];


      for (var k = 0; k < geo.users.length; k++) {
        // $("#salesDropdown option[value='" + geo.users[k].id + "']").prop("selected", true);
        _users.push(geo.users[k].id);
      }


      //console.log(_users);
      $('#salesDropdown').val(_users); //.trigger('change.select2');;
      //$('#salesDropdown').prop('disabled',true);
      $('#salesDropdown').trigger('change.select2');
    } else {
      for (var j = 0; j < geofencesArray.length; j++) {
        if (geofencesArray[j])
          drawShape(geofencesArray[j]);
      }
      $('#salesDropdown').val('');
      //$('#salesDropdown').prop('disabled',false);
      $('#salesDropdown').trigger('change.select2');;
      clearSelection();
    }
  });
  loadSalesman();
});

function MyPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map1.setCenter(initialLocation);
    }, function error(msg) {
      alert('Please enable your GPS position future.');

    }, {
      maximumAge: 600000,
      timeout: 5000,
      enableHighAccuracy: true
    });

  } else {
    alert("Geolocation API is not supported in your browser.");
  }
}


function deleteGeofenceData(id) {
  $.ajax({
    url: "https://cloud.movilcrm.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmRegistrarGeolocalizacionGeocercaDelete&geocerca_id=" + id,
    // The name of the callback parameter, as specified by the YQL service
    jsonp: "callback",
    // Tell jQuery we're expecting JSONP
    dataType: "jsonp",
    // Work with the response
    success: function(response) {
      //console.log(response.rmListaVendedores);
      $('#geofenceDropdown').html('');
      $('#salesDropdown').html('').trigger('change.select2');
      window.location.reload();
    }
  });
}

function loadSalesman() {
  $.ajax({
    url: "https://cloud.movilcrm.com/organica/back_end/rmXMLRPC_login.php?task=rmListaVendedores",
    // The name of the callback parameter, as specified by the YQL service
    jsonp: "callback",
    // Tell jQuery we're expecting JSONP
    dataType: "jsonp",
    // Work with the response
    success: function(response) {
      //console.log(response.rmListaVendedores);
      $('#salesDropdown').html('');
      for (var i = 0; i < response.rmListaVendedores.length; i++) {
        var salesman = response.rmListaVendedores[i];
        $('#salesDropdown').append($("<option value='" + salesman.id + "'>" + salesman.login + "</option>"));
      }
      $('#salesDropdown').select2();
    }
  });
}

function sendGeofenceData(data) {
  var postData = {};
  if (data.geofence) {
    postData.id = data.geofence.id;
    postData.name = data.geofence.name;
    var path = selectedShape.getPath();
    var pathsArray = [];
    for (var i = 0; i < path.length; i++) {
      pathsArray.push({
        'rm_latitude': path.getAt(i).lat(),
        'rm_longitude': path.getAt(i).lng()
      });
    }
    console.log(pathsArray);
    postData.locations = pathsArray;
  } else {
    postData.name = data.name;
    postData.locations = data.pathsArray;
  }
  postData.user_id = data.users_id;

  $.ajax({
    url: "https://cloud.movilcrm.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmRegistrarGeolocalizacionGeocerca",
    // The name of the callback parameter, as specified by the YQL service
    method: "POST",
    // Tell jQuery we're expecting JSONP
    //dataType: "jsonp",

    data: postData,
    // Work with the response
    success: function(response) {
      console.log(respose);
      window.location.reload();
    }
  }).done(function(data) {
    window.location.reload();
  });
}

function getColor(userId) {
  for (var i = 0; i < colors.length; i++) {
    if (colors[i].userId == userId)
      return colors[i];
  }
}

function addColor(userId, color) {
  colors.push({
    'userId': userId,
    'color': color
  });
}

function loadMapData() {
  $.ajax({
    url: "https://cloud.movilcrm.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmListaGeolocalizacionLive",
    // The name of the callback parameter, as specified by the YQL service
    jsonp: "callback",
    // Tell jQuery we're expecting JSONP
    dataType: "jsonp",
    data: {
      mapaVendedorDaterange1: mapaVendedorDaterange1,
      mapaVendedorDaterange2: mapaVendedorDaterange2
    },
    // Work with the response
    success: function(response) {
      list = response.rmListaGeolocalizacionLive;
      if (list) {
        window.list = list;
        polylines = [];
        $('#resultsMap').html('');
        $('#userDropdown').html('');
        $('#userDropdown').append($('<option value="">Seleccionar usuario</option>'));

        var userId = list[0].user_id;
        var loginName = list[0].login;
        //users.push({'id':list[0].user_id,'login':list[0].login});
        var selected = "";
        if (list[0].user_id == selectedUser)
          selected = "selected=selected";
        $('#userDropdown').append($('<option ' + selected + ' value="' + list[0].user_id + '">' + list[0].login + '</option>'));

        // $('#userSelector').append('<option value="'+list[0].user_id+'">'+list[0].login+'</option>');
        var latArray = [];
        for (var i = 0; i < list.length; i++) {
          var option = list[i];
          if (userId != option.user_id) {
            drawLine(latArray, loginName, userId);
            userId = option.user_id;
            loginName = option.login;
            users.push({
              'id': userId,
              'login': loginName
            });
            var selected = "";
            if (userId == selectedUser)
              selected = "selected=selected";
            $('#userDropdown').append($('<option ' + selected + ' value="' + userId + '">' + loginName + '</option>'));

            latArray = [];
          } else {
            if (option.rm_longitude != "72.3488721" && option.rm_latitude != "30.045246199999998") {
              latArray.push({
                lat: parseFloat(option.rm_latitude),
                lng: parseFloat(option.rm_longitude)
              });
            }
          }
        }
        console.log("users:" + JSON.stringify(users));
        drawLine(latArray, loginName, userId);
      }
    }
  });
}

function addMarker(position, color) {
  console.log(color);
  var marker1 = new mapIcons.Marker({
    map: map,
    position: position,
    icon: {
      path: mapIcons.shapes.MAP_PIN,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '',
      strokeWeight: 0
    },
    map_icon_label: '<span class="map-icon map-icon-male"></span>'
  });
}

function drawLine(points, name, userId) {
  //console.log(points);
  if (selectedUser && selectedUser != userId) {
    return false;
  }
  var colorObj = getColor(userId);
  if (!colorObj) {
    var color = '#' + Math.round((0x1000000 + 0xffffff * Math.random())).toString(16).slice(1);
    addColor(userId, color);
  } else {
    color = colorObj.color;
  }
  var line = new google.maps.Polyline({
    path: points,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map,
    geodesic: true,
  });
  polylines.push(line);
  line.setMap(map);

  // console.log(JSON.stringify(points));
  if (points.length) {
    var marker = new google.maps.LatLng(points[0].lat, points[0].lng);
    map.setCenter(marker);
    map.setZoom(17);
    addMarker(marker, color);
  }

}

var selectedShape;
var all_overlays = [];

function deleteSelectedShape() {
  if (selectedShape) {
    selectedShape.setMap(null);
  }
}

function clearSelection() {
  if (selectedShape) {
    selectedShape.setEditable(false);
    selectedShape = null;
  }
}

function deleteAllShape() {
  for (var i = 0; i < all_overlays.length; i++) {
    all_overlays[i].overlay.setMap(null);
  }
  all_overlays = [];
}

function setSelection(shape) {
  clearSelection();
  selectedShape = shape;
  shape.setEditable(true);
  console.log(shape.getPath());
  // google.maps.event.addListener(selectedShape.getPath(), 'insert_at', getPolygonCoords(shape));
  // google.maps.event.addListener(selectedShape.getPath(), 'set_at', getPolygonCoords(shape));
}

function initializeDrawingMap() {
  $('#map-canvas-geofence').html('');
  $("#salesDropdown").val('').trigger('change.select2');;
  $("#geofenceDropdown").val('')
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON,
      ]
    },
    polygonOptions: {
      clickable: true,
      draggable: true,
      editable: true,
      fillColor: '#ffff00',
      fillOpacity: 1,

    }
  });
  var lat = -17.3940469;
  var lng = -66.233916;
  var bounds = new google.maps.LatLngBounds();

  var mapOptions = {
    center: new google.maps.LatLng(lat, lng),
    zoom: 15,
  };
  map1 = new google.maps.Map(document.getElementById('map-canvas-geofence'), mapOptions);
  drawingManager.setMap(map1);
  drawingManager.setDrawingMode(null);
  var centerControlDiv = document.createElement('div');
  var centerControl = new CenterControl(centerControlDiv, map1);

  centerControlDiv.index = 1;
  map1.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv);

  google.maps.event.addDomListener(drawingManager, 'polygoncomplete', function(polygon) {
    path = polygon.getPath();
    for (var i = 0; i < path.length; i++) {
      pathsArray.push({
        'rm_latitude': path.getAt(i).lat(),
        'rm_longitude': path.getAt(i).lng()
      });
    }
    console.log(pathsArray);

  });

  setTimeout(function() {
    loadGeoFences(map1);
  }, 10);
}

function CenterControl(controlDiv, map) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Select to delete the shape';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = 'Delete Selected Area';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    deleteSelectedShape();
  });
}

function loadGeoFences(geofenceMap) {
  var users = $('#salesDropdown').val();
  var url = "https://cloud.movilcrm.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmListaGeolocalizacionGeocerca&v=" + Date.now();

  if (users) {
    url = "https://cloud.movilcrm.com/organica/back_end/rmXMLRPC_geolocalizacion.php?task=rmListaGeolocalizacionGeocerca&user_id=" + users + "&v=" + Date.now();
  }
  console.log(url);
  $.ajax({
    url: url,
    // The name of the callback parameter, as specified by the YQL service
    jsonp: "callback",
    // Tell jQuery we're expecting JSONP
    dataType: "jsonp",
    cache: false,
    // Work with the response
    success: function(response) {
      var geofences = response.rmListaGeolocalizacionGeocerca;
      // console.log(geofences);
      geofenceObjects = [];
      for (var i = 0; geofences && i < geofences.length; i++) {
        var geofence = geofences[i].geofence ? geofences[i].geofence : geofences[i];

        if (!users) {
          geofencesArray[geofence.id] = geofence;
        }
        drawShape(geofence);
      }
      if (!users) {
        $('#geofenceDropdown').html();
        console.log(geofencesArray);
        $('#geofenceDropdown').append($("<option value='' >Select Geofence</option>"));
        for (var j = 0; j < geofencesArray.length; j++) {
          if (geofencesArray[j])
            $('#geofenceDropdown').append($("<option value='" + geofencesArray[j].id + "' >" + geofencesArray[j].name + "</option>"));
        }
      }
      if (bounds.length)
        map1.fitBounds(bounds);
    }
  });
}

function mapInitialize() {
  initializeDrawingMap();
  initialize();
}

function drawShape(geofence, selectFlag) {
  var _locations = geofence.locations;
  var locations = [];
  for (var j = 0; j < _locations.length; j++) {
    var point = new google.maps.LatLng(parseFloat(_locations[j].rm_latitude), parseFloat(_locations[j].rm_longitude));
    locations.push(point);
    bounds.extend(point);
  }
  var color = '#' + Math.round((0x1000000 + 0xffffff * Math.random())).toString(16).slice(1);

  var bermudaTriangle = new google.maps.Polygon({
    paths: locations,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: color,
    fillOpacity: 0.35,
    editable: true
  });
  //console.log(map1);
  bermudaTriangle.setMap(map1);
  geofenceObjects.push(bermudaTriangle);
  if (selectFlag)
    setSelection(bermudaTriangle);

}

function initialize() {
  //console.log('function');
  $('#map-canvas').html('<div class="preloader-spinner themed-background hidden-lt-ie10"></div>');
  var lat = '-17.3940469';
  var lng = '-66.233916';
  var bounds = new google.maps.LatLngBounds();

  var mapOptions = {
    center: new google.maps.LatLng(lat, lng),
    zoom: 12,
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  google.maps.event.trigger(map, 'resize');
  loadMapData();
  var time = parseInt($('#timeDropdown').val(), 10) * 1000;

  setTimeout(function() {
    initialize();
  }, time);
}

if ($('#map-canvas').length != 0) {
  google.maps.event.addDomListener(window, 'load', mapInitialize);
  google.maps.event.addDomListener(document.getElementById("map-canvas-geofence"), 'ready', function() {
    alert(1);
    drawingManager.setMap(map1)
  });

}
