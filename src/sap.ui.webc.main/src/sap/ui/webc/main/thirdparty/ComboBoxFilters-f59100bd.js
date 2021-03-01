sap.ui.define(['exports'], function (exports) { 'use strict';

	const escapeReg = /[[\]{}()*+?.\\^$|]/g;
	const escapeRegExp = str => {
		return str.replace(escapeReg, "\\$&");
	};
	const StartsWith = (value, items) => {
		return items.filter(item => {
			const lowerText = item.text.toLowerCase();
			return lowerText.startsWith(value.toLowerCase());
		});
	};
	const StartsWithPerTerm = (value, items) => {
		const reg = new RegExp(`(^|\\s)${escapeRegExp(value.toLowerCase())}.*`, "g");
		return items.filter(item => {
			reg.lastIndex = 0;
			return reg.test(item.text.toLowerCase());
		});
	};
	const Contains = (value, items) => {
		return items.filter(item => {
			const lowerText = item.text.toLowerCase();
			return lowerText.includes(value.toLowerCase());
		});
	};
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
