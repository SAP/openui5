/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config/camelize"
], (camelize) => {
	"use strict";

	const multipleParams = new Map();
	let oConfig = Object.create(null);

	if (globalThis.document) {
		oConfig = Object.create(null);
		let mOriginalTagNames = {};
		const allMetaTags = globalThis.document.querySelectorAll("meta");
		allMetaTags.forEach(function(tag) {
			const sNormalizedKey = camelize(tag.name);
			const bSapParam = /sap\-?([Uu]?i\-?)?/.test(tag.name);
			if (sNormalizedKey) {
				if (Object.hasOwn(oConfig, sNormalizedKey)) {
					multipleParams.set(sNormalizedKey, mOriginalTagNames[sNormalizedKey]);
				} else {
					oConfig[sNormalizedKey] = tag.content;
					mOriginalTagNames[sNormalizedKey] = tag.name;
				}
			} else if (tag.name && bSapParam) { // tags without explicit name (tag.name === "") are ignored silently
				sap.ui.loader._.logger.error("Invalid configuration option '" + tag.name + "' in meta tag!");
			}
		});
		mOriginalTagNames = undefined;
	}

	const MetaConfigurationProvider = {
		get(sKey) {
			if (multipleParams.has(sKey)) {
				sap.ui.loader._.logger.error("Configuration option '" + multipleParams.get(sKey) + "' was set multiple times. Value '" + oConfig[sKey] + "' will be used");
				multipleParams.delete(sKey);
			}
			return oConfig[sKey];
		}
	};

	return MetaConfigurationProvider;
});