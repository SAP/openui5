sap.ui.define(['../CSP'], function (CSP) { 'use strict';

	const flatten = arr => {
		return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
	};
	const getEffectiveLinksHrefs = (ElementClass, forStaticArea = false) => {
		let stylesData = ElementClass[forStaticArea ? "staticAreaStyles" : "styles"];
		if (!stylesData) {
			return;
		}
		if (!Array.isArray(stylesData)) {
			stylesData = [stylesData];
		}
		return flatten(stylesData).filter(data => !!data).map(data => CSP.getUrl(data.packageName, data.fileName));
	};

	return getEffectiveLinksHrefs;

});
