sap.ui.define(['exports'], function (exports) { 'use strict';

	const escapeReg = /[[\]{}()*+?.\\^$|]/g;
	const escapeRegExp = str => {
		return str.replace(escapeReg, "\\$&");
	};
	const StartsWithPerTerm = (value, items, propName) => {
		const reg = new RegExp(`(^|\\s)${escapeRegExp(value.toLowerCase())}.*`, "g");
		return items.filter(item => {
			const text = item[propName];
			reg.lastIndex = 0;
			return reg.test(text.toLowerCase());
		});
	};
	const StartsWith = (value, items, propName) => items.filter(item => item[propName].toLowerCase().startsWith(value.toLowerCase()));
	const Contains = (value, items, propName) => items.filter(item => item[propName].toLowerCase().includes(value.toLowerCase()));
	const None = (_, items) => items;

	var Filters = /*#__PURE__*/Object.freeze({
		__proto__: null,
		StartsWithPerTerm: StartsWithPerTerm,
		StartsWith: StartsWith,
		Contains: Contains,
		None: None
	});

	exports.Contains = Contains;
	exports.Filters = Filters;
	exports.None = None;
	exports.StartsWith = StartsWith;
	exports.StartsWithPerTerm = StartsWithPerTerm;

});
