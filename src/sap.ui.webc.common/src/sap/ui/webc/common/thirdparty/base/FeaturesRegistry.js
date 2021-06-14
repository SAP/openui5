sap.ui.define(['exports'], function (exports) { 'use strict';

	const features = new Map();
	const registerFeature = (name, feature) => {
		features.set(name, feature);
	};
	const getFeature = name => {
		return features.get(name);
	};

	exports.getFeature = getFeature;
	exports.registerFeature = registerFeature;

	Object.defineProperty(exports, '__esModule', { value: true });

});
