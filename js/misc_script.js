// We call the codeLatLng function to get the zip code from the 
// codeLatLng(latlng).then(function(zipCode){
//     console.log("Zip code returned is: " + zipCode);
// }, function(err){
//     console.log("Not working", err);
// });


// function codeLatLng(latlng) {

//     var deferred = $.Deferred(),
//         geocoder = new google.maps.Geocoder();

//     var latlngStr = latlng.split(',', 2);
//     var lat = parseFloat(latlngStr[0]);
//     var lng = parseFloat(latlngStr[1]);
//     latlng = new google.maps.LatLng(lat, lng);

//     geocoder.geocode({'latLng': latlng}, function(results, status) {
//         if (status == google.maps.GeocoderStatus.OK) {
//             if (results[0]) {
//                 filterZip = results[0].address_components.filter(function(e){
//                     return (e.types[0] === 'postal_code');
//                 });
//                 console.log("Zip code in function: " + filterZip[0].short_name)
//                 deferred.resolve(filterZip[0].short_name);
//             } else {
//                 deferred.reject(console.log('No results found'));
//             }
//         } else {
//             deferred.reject(console.log('Geocoder failed due to: ' + status));
//         }
//     });
//     return deferred.promise();
// }



// Loopa igenom resultaten from market list
            // for (var key in data) {
            //   fmList = data[key];
            //   for (var i = 0; i < fmList.length; i++) {
            //       // var result = fmList[i];
            //       console.log(fmList[i].id + " " + fmList[i].marketname);
            //       // getDetails(result.id);
            //   }
            // }