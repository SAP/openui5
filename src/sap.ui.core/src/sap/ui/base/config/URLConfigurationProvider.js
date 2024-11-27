
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config/camelize"
], (camelize) => {
	"use strict";

	let oConfig = Object.create(null);
	const multipleParams = new Map();

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
					multipleParams.set(sNormalizedKey, mOriginalUrlParams[sNormalizedKey]);
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
		if (multipleParams.has(sKey)) {
			sap.ui.loader._.logger.error("Configuration option '" + multipleParams.get(sKey) + "' was set multiple times. Value '" + oConfig[sKey] + "' will be used");
			multipleParams.delete(sKey);
		}
		return oConfig[sKey];
	}

	const URLConfigurationProvider = {
		external: true,
		get: get
	};

	return URLConfigurationProvider;
});