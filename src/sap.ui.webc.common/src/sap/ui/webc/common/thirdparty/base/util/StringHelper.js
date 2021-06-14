sap.ui.define(['exports'], function (exports) { 'use strict';

	const kebabToCamelMap = new Map();
	const camelToKebabMap = new Map();
	const kebabToCamelCase = string => {
		if (!kebabToCamelMap.has(string)) {
			const result = toCamelCase(string.split("-"));
			kebabToCamelMap.set(string, result);
		}
		return kebabToCamelMap.get(string);
	};
	const camelToKebabCase = string => {
		if (!camelToKebabMap.has(string)) {
			const result = string.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
			camelToKebabMap.set(string, result);
		}
		return camelToKebabMap.get(string);
	};
	const toCamelCase = parts => {
		return parts.map((string, index) => {
			return index === 0 ? string.toLowerCase() : string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
		}).join("");
	};

	exports.camelToKebabCase = camelToKebabCase;
	exports.kebabToCamelCase = kebabToCamelCase;

	Object.defineProperty(exports, '__esModule', { value: true });

});
