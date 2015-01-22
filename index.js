var regexp= /(?:[\{]+(~)?)\w+[\.\/]?[\w]+?(?:[\}]+(~)?)/;
var keyname= /\w+[\.\/]?[\w]+/;

exports.findMustache= function (source) {
	var match;
	var words= 0;
	var matches= [];
	while(match= source.match(regexp)){
		matches.push({ mustache: match[0], index: words+match.index });
		var sliced= match.index+match[0].length;
		source= source.slice(sliced);
		words += sliced;
	}
	return matches;
}

exports.warpWith= function (source, startStr, endStr) {
	var _source= source;
	var match;
	var words= 0;
	var offset= 0;
	while(match= source.match(regexp)){
		// start= (words previously cut) + (offset: the words you add in)
		var start= words+match.index+offset, 
			sliced= match.index+match[0].length;
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

		// slice the words
		// add the sliced length to words
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
