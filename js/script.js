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
        console.log("Map is centered at: " + lat + ", " + lng + ".");

        clearMarkers(markers);
        

        var fmList = [];

        getFarmersMarkets(lat,lng).then(function (results) {

            var fmMList = [];

            var marketListLength = results.results.length;

            console.log("Farmersmarket list(" + marketListLength + ") has been returned.");

            for (var key in results) {
                fmMList = results[key];
                for (var i = 0; i < fmMList.length; i++) {

                    getDetails(fmMList[i].id, fmMList[i].marketname).then(function (results, id, marketname){
                        for (var key in results) {
                            var fmDList = results[key];
                            fmDList['id'] = id;
                            fmDList['marketname'] = marketname
                            console.log('Id for this market is: ' + fmDList['id'] + ' and the name is ' + marketname);
                            console.log('Address: ' + fmDList['Address']);
                            console.log('Googlelink: ' + fmDList['GoogleLink']);

                            var re = /(\d{1,2}[.]\d+)%[A-Z0-9]{2}%[A-Z0-9]{2}([-+]\d{1,3}[.]\d+)/;
                            var latlng = fmDList['GoogleLink'].match(re);
                            fmDList['lat'] = latlng[1];
                            fmDList['lng'] = latlng[2];
                            console.log('lat: ' + fmDList['lat']);
                            console.log('lng: ' + fmDList['lng']);
                        }
                    fmList.push(fmDList);
                    
                    console.log(fmList.length);
                    
                    if (fmList.length === marketListLength){


                        
                        markers = placeMarkers(lat,lng, markers);

                    }
                    }, function (error){
                        console.log("No market details returned. ", error);
                    });
                }
            }
        }, function (error) {
            console.error("Farmersmarket list not returned. Error: ", error);
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

function getFarmersMarkets(lat,lng) {

    var deferred = $.Deferred();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + lat + "&lng=" + lng,
        dataType: 'jsonp',
    }).then(function(data){
        deferred.resolve(data);
    });
    return deferred.promise();
}


function getDetails(id, marketname) {

    var deferred = $.Deferred();

    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        // submit a get request to the restful service mktDetail.
        url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=" + id,
        dataType: 'jsonp',
    }).then(function(data){
        deferred.resolve(data, id, marketname);
    });
    return deferred.promise();
}

google.maps.event.addDomListener(window, 'load', initialize);