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
var json= require(path.resolve(__dirname, './can/canner.json'))
var content= require('fs').readFileSync(path.resolve(__dirname, './can/index.hbs'), 'utf8');
var result= cnHbs.cnWrapHtml(content, json.data, ["/javascripts/dist/apps_main/create.js"], ["/stylesheets/cans/create/create.css"]);
console.log(result)
