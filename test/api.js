var cnHbs= require('../');
var path= require('path');
var Handlebars= require('handlebars');
var source = "{{{name}}}<p id='{{cool}}'>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#each kids}}<li>{{name}} is {{age}}</li>, also have {{#each toy}}*{{this}}{{/each}}{{/each}}, also got {{#each pets}}name: {{name}}, age: {{age}}; {{/each}}</ul>, so hometown: {{hometown}}";
var data = { "cool":"123","name": "Alan", "hometown": "Somewhere, TX",
             "kids": [{"name": "Jimmy", "age": "12", "toy": [1,2,3]}, {"name": "Sally", "age": "4","toy": [2,3,4,5]}],
             "pets": [{name: "bee", age: 12}, {name: "beeds", age: 14}]
         	};

//var html= '<img alt="{{alt}}" src="{{src}}" itemprop="image">'
/*
// cnwrap
var wrap= cnHbs.cnWrap(source);
var template= Handlebars.compile(wrap.node, {trackIds: true});
var html= template(data);
//console.log(html)

// find all mustache, include inblock mustaches
var matches= cnHbs.findMustache(source);
console.log(matches);

// wrapWith
var newstring= cnHbs.warpWith(source, "##", "##");
console.log(newstring);

// enclose with html tag
console.log(
	cnHbs.encloseHtmlTag(source, 
		'x-cn', 
		{ class: "cn-key pupu me", ur: 'test', key: '$' }
		)
	);
*/

// test cnWrapHtml
var json= require(path.resolve(__dirname, './can/shopper.json'))
var content= require('fs').readFileSync(path.resolve(__dirname, './can/shopper.hbs'), 'utf8');
var opts= {
	token: '123123',
	insertBody: [
		{
			tag: 'div',
			id: 'cn-draggable-area'
		},
		{
			tag: 'div',
			id: 'cn-popup'
		},
		{
			tag: 'input',
			id: 'guide',
			type: 'hidden',
			value: false
		}],
	banner: true
}
var hbsParse= cnHbs.cnWrapHtml(content, json.data, ["/javascripts/dist/apps_main/create.js"], ["/stylesheets/cans/create/create.css"], opts);
hbsParse.then(function (result) {
	console.log(result)
}).catch(function (err) {
	console.log(err.stack)
})
//console.log(result);
//console.log(cnHbs.cnWrapHtml(html, { alt: "123", src: "1234" }))
