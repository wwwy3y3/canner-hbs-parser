var cnHbs= require('../');
var source = "{{{name}}}<p>Hello, my name is\n {{name}}. {{cool/qwe}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
var matches= cnHbs.findMustache(source);
console.log(matches)