sap.ui.define(['exports'], function (exports) { 'use strict';

	let suf;
	let rulesObj = {
		include: [/^ui5-/],
		exclude: [],
	};
	const tagsCache = new Map();
	const setCustomElementsScopingSuffix = suffix => {
		if (!suffix.match(/^[a-zA-Z0-9_-]+$/)) {
			throw new Error("Only alphanumeric characters and dashes allowed for the scoping suffix");
		}
		suf = suffix;
	};
	const getCustomElementsScopingSuffix = () => {
		return suf;
	};
	const setCustomElementsScopingRules = rules => {
		if (!rules || !rules.include) {
			throw new Error(`"rules" must be an object with at least an "include" property`);
		}
		if (!Array.isArray(rules.include) || rules.include.some(rule => !(rule instanceof RegExp))) {
			throw new Error(`"rules.include" must be an array of regular expressions`);
		}
		if (rules.exclude && (!Array.isArray(rules.exclude) || rules.exclude.some(rule => !(rule instanceof RegExp)))) {
			throw new Error(`"rules.exclude" must be an array of regular expressions`);
		}
		rules.exclude = rules.exclude || [];
		rulesObj = rules;
		tagsCache.clear();
	};
	const getCustomElementsScopingRules = () => {
		return rulesObj;
	};
	const shouldScopeCustomElement = tag => {
		if (!tagsCache.has(tag)) {
			const result = rulesObj.include.some(rule => tag.match(rule)) && !rulesObj.exclude.some(rule => tag.match(rule));
			tagsCache.set(tag, result);
		}
		return tagsCache.get(tag);
	};
	const getEffectiveScopingSuffixForTag = tag => {
		if (shouldScopeCustomElement(tag)) {
			return getCustomElementsScopingSuffix();
		}
	};

	exports.getCustomElementsScopingRules = getCustomElementsScopingRules;
	exports.getCustomElementsScopingSuffix = getCustomElementsScopingSuffix;
	exports.getEffectiveScopingSuffixForTag = getEffectiveScopingSuffixForTag;
	exports.setCustomElementsScopingRules = setCustomElementsScopingRules;
	exports.setCustomElementsScopingSuffix = setCustomElementsScopingSuffix;
	exports.shouldScopeCustomElement = shouldScopeCustomElement;

	Object.defineProperty(exports, '__esModule', { value: true });

});
