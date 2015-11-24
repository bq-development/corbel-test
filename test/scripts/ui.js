/*

//  var newItem = document.createElement('LI');       // Create a <li> node
// var textnode = document.createTextNode('Crazy devie techie stuff');  // Create a text node
// newItem.appendChild(textnode);                    // Append the text to <li>

// var list = document.getElementById('mocha');    // Get the <ul> element to insert a new node
// list.insertBefore(newItem, list.childNodes[0]);  // Insert <li> before the first child of <ul>

var config = {
	URL_BASE_ORIGINAL: 'https://{{module}}-{{ENV}}.bqws.io/v1.0/',
	ENV: 'qa'
};

window.localStorage.setItem('config', JSON.stringify(config));


$('</div>').attr('id', 'menu').appendTo('body');
$('#menu #content').load('partials/menu.html', function() {
});

var newItem = document.createElement('LI');       // Create a <li> node
var textnode = document.createTextNode('Crazy devie techie stuff');  // Create a text node
newItem.appendChild(textnode);                    // Append the text to <li>

var list = document.getElementById('mocha');    // Get the <ul> element to insert a new node
list.insertBefore(newItem, list.childNodes[0]);  // Insert <li> before the first child of <ul>
*/