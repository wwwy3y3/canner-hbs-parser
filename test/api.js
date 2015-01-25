var cnHbs= require('../');
var source = "{{{name}}}<p>Hello, my name is {{name}}. {{cool/qwe}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>, so hometown: {{hometown}}";

var parser= require('../lib/parser');
console.log(parser.parse(source));
// find all mustache, include inblock mustaches
/*
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
	);*/