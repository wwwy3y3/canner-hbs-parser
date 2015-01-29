var regexp= /(?:[\{]+(~)?)\w+[\.\/]?[\w]+?(?:[\}]+(~)?)/;
var keyname= /\w+[\.\/]?[\w]+/;
var inBlock= /(?:\{\{(~)?#)/;
var notInBlock= /(?:\{\{(~)?\/)/;
var Handlebars= require('handlebars');
var contentNode= require('./lib/contentNode');
var indexNode= require('./lib/indexNode');

exports.cnWrap= function (source) {
	var ast= Handlebars.parse(source);
	// wrap all mustache with cn tag
	return wrapNodes(ast);
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


function wrapNodes (programNode, path) {
	// if block
	if(programNode.type=='program' || programNode.type=='block'){
		var ret= [];
		if(programNode.statements)
			var statements= programNode.statements;
		else if(programNode.program)
			var statements= programNode.program.statements;
		statements.forEach(function (node, index) {
			if(node.type=='block'){
				path= (path)?path+'.'+node.mustache.params[0].string:node.mustache.params[0].string;
				ret.push(wrapNodes(node, path));
			}else if(node.type=='mustache'){
				// single node
				// wrap 

				// build a tag
				if(programNode.mustache && programNode.mustache.id && programNode.mustache.id.string=='each'){
					var tag= '<x-cn key="'+ path+'[';
					ret.push(contentNode(tag));

					//index
					ret.push(indexNode());

					// start tag close
					tag= (node.id.string)?'].'+node.id.string+'">':']">';
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
