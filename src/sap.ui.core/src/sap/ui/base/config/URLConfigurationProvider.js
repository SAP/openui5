
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config/camelize"
], (camelize) => {
	"use strict";

	let oConfig = Object.create(null);

	if (globalThis.location) {
		oConfig = Object.create(null);
		let mOriginalUrlParams = {};
		const sLocation = globalThis.location.search;
		const urlParams = new URLSearchParams(sLocation);
		urlParams.forEach(function(value, key) {
			const bSapParam = /sap\-?([Uu]?i\-?)?/.test(key);
			const sNormalizedKey = camelize(key);
			if (sNormalizedKey) {
				if (Object.hasOwn(oConfig, sNormalizedKey)) {
					sap.ui.loader._.logger.error("Configuration option '" + key + "' was already set by '" + mOriginalUrlParams[sNormalizedKey] + "' and will be ignored!");
				} else {
					oConfig[sNormalizedKey] = value;
					mOriginalUrlParams[sNormalizedKey] = key;
				}
			} else if (bSapParam) {
				sap.ui.loader._.logger.error("Invalid configuration option '" + key + "' in url!");
			}
		});
		mOriginalUrlParams = undefined;
	}

	function get(sKey) {
		return oConfig[sKey];
	}

	const URLConfigurationProvider = {
		external: true,
		get: get
	};

	return URLConfigurationProvider;
});