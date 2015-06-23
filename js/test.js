var results = [
{
   "address_components" : [
   {
      "long_name" : "101-199",
      "short_name" : "101-199",
      "types" : [ "street_number" ]
   },
   {
      "long_name" : "East Fremont Street",
      "short_name" : "E Fremont St",
      "types" : [ "route" ]
   },
   {
      "long_name" : "95202",
      "short_name" : "95202",
      "types" : [ "postal_code" ]
   }
   ]
}]

var address_components = [
   {
      "long_name" : "101-199",
      "short_name" : "101-199",
      "types" : [ "street_number" ]
   },
   {
      "long_name" : "East Fremont Street",
      "short_name" : "E Fremont St",
      "types" : [ "route" ]
   },
   {
      "long_name" : "95202",
      "short_name" : "95202",
      "types" : [ "postal_code" ]
   }
]

// console.log(results.address_components[1]);

var k = results[0].address_components.filter(function(e){
   return (e.types[0] === 'postal_code');
});

console.log(k);

console.log(k[0].short_name);

// var filter = results.filter(function (e) {
//   if (e.address_components[1].types[0] === 'postal_code') {

//    console.log(short_name);

//    }
// });
