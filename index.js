var regexp= /(?:[\{]+(~)?)\w+[\.\/]?[\w]+?(?:[\}]+(~)?)/;

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

exports.warpWithXTag= function (source, startStr, endStr) {
	var _source= source;
	var match;
	var words= 0;
	var offset= 0;
	while(match= source.match(regexp)){
		var start= words+match.index+offset, 
			end= words+match.index+match[0].length+offset,
			sliced= match.index+match[0].length;
		source= source.slice(sliced);
		words += sliced;
		_source= spliceSlice(_source, start, startStr);
		offset += startStr.length;
		_source= spliceSlice(_source, end+endStr.length, endStr);
		offset += endStr.length;
	}
	return _source;
}

function spliceSlice(str, index, is_str) {
  return str.slice(0, index) + (is_str || "") + str.slice(index);
}
