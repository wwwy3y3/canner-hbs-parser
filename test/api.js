var cnHbs= require('../');
var source = "{{{name}}}<p>Hello, my name is {{name}}. {{cool/qwe}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>, so hometown: {{hometown}}";
var matches= cnHbs.findMustache(source, true);
console.log(matches);
//console.log(cnHbs.encloseHtmlTag(source, 'x-cn', { class: "cn-key pupu me", ur: 'test', key: '$' }));