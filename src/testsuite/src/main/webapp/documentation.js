sap.ui.define([], async () => {
	"use strict";

	async function fetchHead(url) {
		const response = await fetch(url, {method: "HEAD"});
		return response.ok || response.status === 304;
	}

	// Demo Kit in static navigation mode
	window['sap-ui-documentation-static'] = true;


	// when documentation-config.js doesn't exist or doesn't define a configuration, probe default values
	const config = window['sap-ui-documentation-config'] = window['sap-ui-documentation-config'] ?? {};

	if (!config.demoKitResourceOrigin) {
		config.demoKitResourceOrigin = '.';
	}

	if (!config.apiInfoRoot) {
		// probe for api-index.json
		if ( await fetchHead(config.demoKitResourceOrigin + "/docs/api/api-index.json") ) {
			config.apiInfoRoot = "./test-resources/";
		}
	}

	if (!config.docuPath) {
		if ( await fetchHead(config.demoKitResourceOrigin + "/docs/topics/index.json") ) {
			config.docuPath = "./docs/topics/";
		}
	}

	// Get Visibility Level Information
	// "internal" will show APIs marked with "@public", "@protected" or "@ui5-restricted"
	// anything else will show APIs marked with "@public" or "@protected"
	var oUrlParams = new URLSearchParams(document.location.search);
	config.visibility = oUrlParams.get("visibility") || "external";

	sap.ui.require([
		"sap/m/Page",
		"sap/ui/core/ComponentContainer",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/documentation/sdk/Component"
	], (Page, ComponentContainer, APIInfo, SDKComponent) => {
		// apply collected information
		if ( typeof config.apiInfoRoot === 'string' ) {
			APIInfo._setRoot(config.apiInfoRoot);
		} else {
			window['sap-ui-documentation-hideApiSection'] = true;
		}
		if ( typeof config.docuPath === 'string' ) {
			SDKComponent.getMetadata().getManifest()["sap.ui5"]["config"]["docuPath"] = config.docuPath;
		} else {
			window['sap-ui-documentation-hideTopicSection'] = true;
		}

		// initialize the UI component
		new Page({
			showHeader : false,
			content : new ComponentContainer({
				height : "100%",
				name : "sap.ui.documentation.sdk",
				manifest: true,
				settings : {
					id : "sdk"
				}
			})
		}).placeAt("content");
	});
});
