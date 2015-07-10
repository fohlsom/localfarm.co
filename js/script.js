var map;
var marker;
var markers = [];

function initialize() {

 var mapOptions = {
    center: new google.maps.LatLng(37.6052668,-122.2342566),
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};

var options = {
    types: ['(regions)'],
    componentRestrictions: {country: 'us'}
};

map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

var input = /** @type {HTMLInputElement} */(
    document.getElementById('pac-input'));

map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

var autocomplete = new google.maps.places.Autocomplete(input, options);
autocomplete.bindTo('bounds', map);

var infowindow = new google.maps.InfoWindow();
marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
});


google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    place = autocomplete.getPlace();
    // We remove the error class for proper results. 
    $( "input" ).removeClass("controls-error");
    // We add the error class for proper results. 
    if (!place.geometry) {
        console.log("Fel");
        $( ".controls" ).toggleClass("controls-error");
        return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);  // Why 17? Because it looks good.
    }

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
        address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
    }

    var lat = place.geometry.location["A"];
    var lng = place.geometry.location["F"];
    var latlng = lat + ", " + lng;


    clearMarkers(markers);
    markers = placeMarkers(lat,lng, markers);

    // We call the codeLatLng function to get the zip code from the 
    codeLatLng(latlng).then(function(zipCode){
        console.log("Zip code returned is: " + zipCode);
    }, function(err){
        console.log("Not working", err);
    });
    

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker);
});
}

function clearMarkers(){

  for (var i = 0; i < markers.length; i++){
    markers[i].setMap(null);
}
markers = [];
}

function placeMarkers(lat, lng, markers) {

  var marketList = [
  ['Market Divis', lat * 1.0001, lng * 1.0001],
  ['Market Kongo', lat * 1.00015, lng * 1.00015],
  ['Market Bongo', lat * 1.00017, lng * 1.00017],
  ['Market China', lat * 1.00019, lng * 1.00019],
  ['Market Indo', lat * 1.00021, lng * 1.00021]
  ];

  for (var i = 0; i < marketList.length; i++) {
    var market = marketList[i];
    var marketLatLng = new google.maps.LatLng(market[1], market[2]);
    var marker = new google.maps.Marker({
        position: marketLatLng,
        map: map,
        title: market[0]
    });
    markers.push(marker);
}
console.log(markers);

return markers;
}

function codeLatLng(latlng) {

    var deferred = $.Deferred(),
        geocoder = new google.maps.Geocoder();

    var latlngStr = latlng.split(',', 2);
    var lat = parseFloat(latlngStr[0]);
    var lng = parseFloat(latlngStr[1]);
    latlng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                filterZip = results[0].address_components.filter(function(e){
                    return (e.types[0] === 'postal_code');
                });
                console.log("Zip code in function: " + filterZip[0].short_name)
                deferred.resolve(filterZip[0].short_name);
            } else {
                deferred.reject(console.log('No results found'));
            }
        } else {
            deferred.reject(console.log('Geocoder failed due to: ' + status));
        }
    });
    return deferred.promise();
}



google.maps.event.addDomListener(window, 'load', initialize);
