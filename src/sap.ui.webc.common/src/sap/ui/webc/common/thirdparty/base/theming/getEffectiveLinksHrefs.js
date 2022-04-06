sap.ui.define(['../CSP', '../FeaturesRegistry'], function (CSP, FeaturesRegistry) { 'use strict';

	const flatten = arr => {
		return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
	};
	const getEffectiveLinksHrefs = (ElementClass, forStaticArea = false) => {
		let stylesData = ElementClass[forStaticArea ? "staticAreaStyles" : "styles"];
		const OpenUI5Enablement = FeaturesRegistry.getFeature("OpenUI5Enablement");
		if (!stylesData) {
			return;
		}
		if (!Array.isArray(stylesData)) {
			stylesData = [stylesData];
		}
		if (OpenUI5Enablement) {
			stylesData.push(OpenUI5Enablement.getBusyIndicatorStyles());
		}
		return flatten(stylesData).filter(data => !!data).map(data => CSP.getUrl(data.packageName, data.fileName));
	};

	return getEffectiveLinksHrefs;

});
