
sap.ui.loader.config({
	shim: {
		"sap/ui/demo/cardExplorer/scripts/resolveDemokitURLs": {
			exports: "resolveDemokitURL"
		}
	}
});

sap.ui.define(["sap/ui/demo/cardExplorer/scripts/resolveDemokitURLs"], function (resolveDemokitURL) {
	"use strict";

	return {
		resolveDemokitURL: resolveDemokitURL
	};
});