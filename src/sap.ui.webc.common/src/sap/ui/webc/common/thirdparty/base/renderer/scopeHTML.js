sap.ui.define(function () { 'use strict';

	const cache = new Map();
	const scopeHTML = (strings, tags, suffix) => {
		if (suffix && tags && tags.length) {
			strings = strings.map(string => {
				if (cache.has(string)) {
					return cache.get(string);
				}
				let result = string;
				tags.forEach(tag => {
					result = result.replace(new RegExp(`(</?)(${tag})(/?[> \t\n])`, "g"), `$1$2-${suffix}$3`);
				});
				cache.set(string, result);
				return result;
			});
		}
		return strings;
	};

	return scopeHTML;

});
