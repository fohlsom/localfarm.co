var map;
var marker;
var markers = [];


function initialize() {

    getWindowHeight();    

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
    // autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });


    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        place = autocomplete.getPlace();
        
        // We remove the error class for proper results. 
        $( "input" ).removeClass("controls-error");

        // We add the error class for proper results. 
        if (!place.geometry) {
            console.log("Fel");
            $( ".controls" ).toggleClass("controls-error");
            document.getElementById("pac-input").value = "";
            $("input").attr("placeholder", "Select a location from the drop-down list.");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }

        var lat = place.geometry.location["A"];
        var lng = place.geometry.location["F"];
        var latlng = lat + ", " + lng;
        console.log("Map is centered at: " + lat + ", " + lng + ".");

        clearMarkers(markers);        

        getFarmersMarkets(lat,lng).then(function (results) {
            var fmList = [];
            var fmMList = [];

            var marketListLength = results.results.length;
            console.log(results.results);
            console.log(results.results[0].id);
            if (results.results[0].id === "Error"){
                $( "div.alert" ).toggle();
            };

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

                        console.log(fmList);
                            
                        markers = placeMarkers(lat,lng, markers, fmList);

                    }
                    }, function (error){
                        console.log("No market details returned. ", error);
                    });
                }
            }
        }, function (error) {
            console.error("Farmersmarket list not returned. Error: ", error);
        });
    });
}

function clearMarkers(){
    for (var i = 0; i < markers.length; i++){
        markers[i].setMap(null);
    }
    markers = [];
}

function placeMarkers(lat, lng, markers, fmList) {

    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < fmList.length; i++) {
    
        var market = fmList[i];
        var marketLatLng = new google.maps.LatLng(market['lat'], market['lng']);
        var marker = new google.maps.Marker({
            position: marketLatLng,
            map: map,
            title: market['Address']
        });
        bounds.extend(marker.getPosition());

        markers.push(marker);
    }
    // map.setCenter(center); 
    map.fitBounds(bounds);
    // map.setCenter(bounds.getCenter());
    
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

function getWindowHeight() {
    $(window).resize(function () {
        var h = $(window).height(),
        offsetTop = 60; // Calculate the top offset

        $('#map-canvas').css('height', (h - offsetTop));
    }).resize();
}





google.maps.event.addDomListener(window, 'load', initialize);