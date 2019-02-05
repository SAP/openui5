sap.ui.define(["sap/ui/integration/services/Navigation"], function (Navigation) {
	"use strict";

	var SampleNavigation = Navigation.extend();

	function getUrl(oContext) {
		var sUrl = "";

		if (oContext.manifestParameters && oContext.manifestParameters.url && typeof oContext.manifestParameters.url === "string") {
			sUrl = oContext.manifestParameters.url;
		}

		if (oContext.semanticObject && oContext.semanticObject.url && typeof oContext.semanticObject.url === "string") {
			sUrl = oContext.semanticObject.url;
		}

		return sUrl;
	}

	SampleNavigation.prototype.enabled = function (oContext) {

		if (!oContext) {
			return Promise.resolve(true);
		}

		var sUrl = getUrl(oContext);
		if (sUrl) {
			return Promise.resolve(true);
		} else {
			return Promise.resolve(false);
		}
	};

	SampleNavigation.prototype.navigate = function (oContext) {
		if (!oContext) {
			return;
		}

		var sUrl = getUrl(oContext);
		if (sUrl) {
			window.open(sUrl, "_blank");
		}
	};

	return SampleNavigation;
});