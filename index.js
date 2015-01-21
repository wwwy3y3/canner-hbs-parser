var regexp= /(?:[\{]+(~)?)\w+[\.\/]?[\w]+?(?:[\}]+(~)?)/;

exports.findMustache= function (source) {
	var match;
	var matches= [];
	while(match= source.match(regexp)){
		matches.push({ mustache: match[0], index: match.index });
		source= source.slice(match.index+match[0].length);
	}
	return matches;
}

