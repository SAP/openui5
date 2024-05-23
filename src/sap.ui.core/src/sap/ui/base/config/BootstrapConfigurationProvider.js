/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config/camelize"
], (camelize) => {
	"use strict";
	const oConfig = Object.create(null);
	const rAlias = /^(sapUiXx|sapUi|sap)((?:[A-Z0-9][a-z]*)+)$/; //for getter
	/* helper for finding the bootstrap tag */
	function getBootstrapTag() {
		var oResult;
		function check(oScript, rUrlPattern) {
			var sUrl = oScript && oScript.getAttribute("src");
			var oMatch = rUrlPattern.exec(sUrl);
			var oTagInfo;
			if (oMatch) {
				oTagInfo = {
					tag: oScript,
					url: sUrl,
					resourceRoot: oMatch[1] || ""
				};
			}
			return oTagInfo;
		}
		if (globalThis.document) {
			var rResources = /^((?:.*\/)?resources\/)/,
				rBootScripts, aScripts, i;
			// Prefer script tags which have the sap-ui-bootstrap ID
			// This prevents issues when multiple script tags point to files named
			// "sap-ui-core.js", for example when using the cache buster for UI5 resources
			oResult = check(globalThis.document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), rResources);
			if (!oResult) {
				aScripts = globalThis.document.querySelectorAll('SCRIPT[src]');
				rBootScripts = /^([^?#]*\/)?(?:sap-ui-(?:core|custom|boot|merged)(?:-[^?#/]*)?|jquery.sap.global|ui5loader(?:-autoconfig)?)\.js(?:[?#]|$)/;
				for (i = 0; i < aScripts.length; i++) {
					oResult = check(aScripts[i], rBootScripts);
					if (oResult) {
						break;
					}
				}
			}
		}
		return oResult || {};
	}
	const bootstrap = getBootstrapTag();
	if (bootstrap.tag) {
		const dataset = bootstrap.tag.dataset;
		if (dataset) {
			for (const sKey in dataset) {
				const sNormalizedKey = camelize(sKey);
				if (!sNormalizedKey) {
					sap.ui.loader._.logger.error("Invalid configuration option '" + sKey + "' in bootstrap!");
				} else if (Object.hasOwn(oConfig, sNormalizedKey)) {
					sap.ui.loader._.logger.error("Configuration option '" + sKey + "' already exists and will be ignored!");
				} else {
					oConfig[sNormalizedKey] = dataset[sKey];
				}
			}
		}
	}
	function get(sKey) {
		let vValue = oConfig[sKey];
		if (vValue === undefined) {
			const vMatch = sKey.match(rAlias);
			const sLowerCaseAlias = vMatch ? vMatch[1] + vMatch[2][0] + vMatch[2].slice(1).toLowerCase() : undefined;
			if (sLowerCaseAlias) {
				vValue = oConfig[sLowerCaseAlias];
			}
		}
		return vValue;
	}
	const BootstrapConfigurationProvider = {
		get: get,
		_: {
			getBootstrapTag: getBootstrapTag
		}
	};
	return BootstrapConfigurationProvider;
});
