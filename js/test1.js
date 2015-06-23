var l = [];

l.push({'name':'fred', 'type':1});
l.push({'name':'nic', 'type':2});
l.push({'name':'johnny', 'type':3});
l.push({'name':'bob', 'type':3});
l.push({'name':'mark', 'type':3});

var k = l.filter(function(e){
	return (e.type === 2);
});

console.log(k);

// console.log(k[0].name);