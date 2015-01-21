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

