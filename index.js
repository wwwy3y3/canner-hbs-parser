var Handlebars= require('handlebars');
var jsdom= require('jsdom').jsdom;

// regex
var regexp= /(?:[\{]+(~)?)\w+[\.\/]?[\w]+?(?:[\}]+(~)?)/;
var keyname= /\w+[\.\/]?[\w]+/;
var inBlock= /(?:\{\{(~)?#)/;
var notInBlock= /(?:\{\{(~)?\/)/;
var htmlOnTag= /</g;
var htmlOffTag= />/g;
var htmlTagName= /<\/?[\w-]+/g;

//nodes
var contentNode= require('./lib/contentNode');
var indexNode= require('./lib/indexNode');
var contextPathNode= require('./lib/contextPathNode');

// whole package of cnWrap to html
// wrap only body
// head not
exports.cnWrapHtml= function (source, data, scripts, stylesheets) {
	var document = jsdom(source);
	var window = document.parentWindow;
	
	// body html
	var bodyHbs= exports.cnWrap(window.document.body.outerHTML);
	var template= Handlebars.compile(bodyHbs.node, {trackIds: true})
	var bodyHtml= template(data);

	// head
	var headHbs= window.document.head.outerHTML;
	var headHtml= Handlebars.compile(headHbs)(data);

	// replace body
	var newBody = document.createElement('body');
	newBody.innerHTML= jsdom(bodyHtml).parentWindow.document.body.innerHTML;
	window.document.documentElement.replaceChild( 
		newBody,
		window.document.body
		)

	// replace head
	var newHead = document.createElement('head');
	newHead.innerHTML= jsdom(headHtml).parentWindow.document.head.innerHTML;

	// insert scripts
	scripts= scripts || [];
	scripts.forEach(function (script) {
		var ele = window.document.createElement("script");
		ele.src = script;
		ele.type="text/javascript";
		newHead.appendChild(ele);
	})
	// insert stylesheets
	stylesheets= stylesheets || [];
	stylesheets.forEach(function (stylesheet) {
		var ele = window.document.createElement("link");
		ele.rel= 'stylesheet';
		ele.href = stylesheet;
		newHead.appendChild(ele);
	})

	window.document.documentElement.replaceChild( 
		newHead,
		window.document.head
		)

	return {html: window.document.documentElement.outerHTML, skip: bodyHbs.skip};
}


exports.cnWrap= function (source) {
	var ast= Handlebars.parse(source);
	// wrap all mustache with cn tag
	var arr= []
	var node= wrapNodes(ast, 0, arr);
	return {node:node, skip: arr};
}

exports.findMustache= function (source, skipBlock) {
	var match;
	var words= 0;
	var matches= [];
	var lastLine= '';
	var block= false;

	while(match= source.match(regexp)){
		// the index slice begin= the last char index of match word
		var sliced= match.index+match[0].length;

		// check if we are inBlock
		lastLine += source.slice(0, match.index);
		if(lastLine.match(inBlock))
			block= true;
		if(lastLine.match(notInBlock))
			block= false;

		// lastline= lastline we sliced
		lastLine= source.slice(0, sliced);
		source= source.slice(sliced);

		//
		if(skipBlock){
			if(!block)
				matches.push({ mustache: match[0], index: words+match.index });
		}else{
			matches.push({ mustache: match[0], index: words+match.index });
		}
			
		words += sliced;
	}
	return matches;
}

exports.warpWith= function (source, startStr, endStr) {
	var _source= source;
	var match;
	var words= 0;
	var offset= 0;
	var lastLine= '';
	var block= false;
	while(match= source.match(regexp)){
		// start= (words previously cut) + (offset: the words you add in)
		var start= words+match.index+offset, 
			sliced= match.index+match[0].length;

		// check if we are inBlock
		lastLine += source.slice(0, match.index);
		if(lastLine.match(inBlock))
			block= true;
		if(lastLine.match(notInBlock))
			block= false;

		// if skip block and not in block
		if(!block){
			// replace $
			if(startStr.indexOf('$'))
				var _startStr= startStr.replace('$', match[0].match(keyname)[0]);
			else
				var _startStr= startStr;

			// prepend start string
			_source= spliceSlice(_source, start, _startStr);
			// the offset start string made
			offset += _startStr.length;

			// end
			if(endStr.indexOf('$'))
				var _endStr= endStr.replace('$', match[0].match(keyname)[0]);
			else
				var _endStr= endStr;

			var end= words+match.index+match[0].length+offset;
			_source= spliceSlice(_source, end, _endStr);
			offset += _endStr.length;
		}
			

		// slice the words
		// add the sliced length to words
		// lastline= lastline we sliced
		lastLine= source.slice(0, sliced);
		source= source.slice(sliced);
		words += sliced;
		// recover startStr, endStr
		_startStr= startStr;
		_endStr= endStr;
	}
	return _source;
}

exports.encloseHtmlTag= function (source, tag, attributes) {
	var tag= tagBuilder(tag, attributes);
	return exports.warpWith(source, tag.start, tag.end);
}

function tagBuilder (tag, attr) {
	// return object with { start: '<p>', end: '</p>'}
	 var attributestr = ""

    if(attr){
    	for(key in attr){
    		attributestr += " ";
    		attributestr += key + "=" + "\""+attr[key]+ "\"";
    	}
    }

    return { 
    			start: "<" + tag + attributestr + ">",
    			end  : "</" + tag + ">"
    	   }
}

function spliceSlice(str, index, is_str) {
  return str.slice(0, index) + (is_str || "") + str.slice(index);
}

function insert (arr, index, element) {
	if(index<0) index=0;
	return arr.splice(index,0,element);
}


function wrapNodes (programNode, num, arr, preTag) {
	// if block
	if(programNode.type=='program' || programNode.type=='block'){
		var ret= [];
		if(programNode.statements)
			var statements= programNode.statements;
		else if(programNode.program)
			var statements= programNode.program.statements;
		statements.forEach(function (node, index) {
			if(node.type=='block'){
				ret.push(wrapNodes(node, num, arr, preTag));
			}else if(node.type=='mustache'){
				// single node
				// wrap 
				if(num>0){
					ret.push(node);
					node.preTag= preTag;
					arr.push(node);
					return;
				}
					

				// build a tag
				if(programNode.mustache && programNode.mustache.id && programNode.mustache.id.string=='each'){
					var tag= '<x-cn key="';
					ret.push(contentNode(tag));

					// contextPathNode
					ret.push(contextPathNode());
					if(node.id.string)
						ret.push(contentNode('.'+node.id.string));

					// start tag close
					tag= '">';
					ret.push(contentNode(tag));
					
					// add node
					ret.push(node);

					// close tag
					tag= '</x-cn>';
					ret.push(contentNode(tag));
				}else{
					var tag= tagBuilder('x-cn', { key: node.id.string });
					// push
					ret.push(contentNode(tag.start));
					ret.push(node);
					ret.push(contentNode(tag.end));
				}
			}else if(node.type=='content'){
				// content
				// check if in html tag
				var string= node.string;
				var open= (l= string.match(htmlOnTag))?l.length:0;
				var close= (l= string.match(htmlOffTag))?l.length:0;

				// get preTag
				var s= string.match(htmlTagName);
				if(s)
					preTag= s[s.length-1].slice(1);

				num+= open;
				num-= close;
				ret.push(node);
			}else{
				ret.push(node);
			}
		})

		if(programNode.statements)
			programNode.statements= ret;
		else if(programNode.program)
			programNode.program.statements= ret;
	}
	return programNode;
}
